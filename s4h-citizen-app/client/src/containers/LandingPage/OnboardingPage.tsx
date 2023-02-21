import D4LSDK from '@d4l/js-sdk';
import queryString from 'query-string';
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ConnectedProps, connect as reduxConnect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ViewHeader from '../../components/ViewHeader';
import ViewWrapper from '../../components/ViewWrapper';
import config from '../../config';
import i18n from '../../i18n';
import { selectIsCookieChoiceMade } from '../../redux/globalsSlice';
import { AppState } from '../../redux';
import { AuthorisationData } from '../../types';
import cryptoRandomString from '../../utils/cryptoRandomString';
import d4lDB from '../../utils/D4LDB';
import { getAllScopes } from '../../utils/scopes';
import settings from '../../utils/settings';
import webComponentWrapper from '../../utils/webComponentWrapper';
import Funding from './Funding';
import './OnboardingPage.scss';

const mapStateToProps = (state: AppState) => ({
  isCookieChoiceMade: selectIsCookieChoiceMade(state),
});

const connector = reduxConnect(mapStateToProps);

type Props = ConnectedProps<typeof connector> &
  WithTranslation &
  RouteComponentProps;

class OnboardingPage extends Component<Props> {
  async generateAuthorisationUrl() {
    const { language } = i18n;
    const { isCookieChoiceMade } = this.props;
    const { acceptsCookies, acceptsTracking } = settings;

    // @ts-ignore
    const keyPair = await D4LSDK.crypto.generateAppKeyPair();

    const base64PublicKey = btoa(JSON.stringify(keyPair.publicKey));
    const base64PrivateKey = btoa(JSON.stringify(keyPair.privateKey));
    const authorisationState = cryptoRandomString();

    await d4lDB.set('authorisationState', authorisationState);
    await d4lDB.set('public-key', base64PublicKey);

    // @ts-ignore
    const sealedCAP = await D4LSDK.sealCAP(base64PrivateKey);
    await d4lDB.set('temp-cap', sealedCAP);

    let authorisationData: AuthorisationData = {
      client_id: config.REACT_APP_OAUTH_CLIENT_ID,
      redirect_uri: config.REACT_APP_OAUTH_REDIRECT_URI,
      response_type: 'code',
      scope: getAllScopes(),
      public_key: base64PublicKey,
      state: authorisationState,
      lng: language,
      product_id: config.ANALYTICS_PRODUCTS_DIMENSION_VALUE,
      project_id: config.ANALYTICS_PROJECTS_DIMENSION_VALUE,
    };

    if (isCookieChoiceMade) {
      authorisationData['accepts_cookies'] = acceptsCookies;
      authorisationData['accepts_tracking'] = acceptsTracking;
    }

    return `${config.REACT_APP_GC_HOST}${
      config.REACT_APP_PROXY_VEGA_BASE_ENDPOINT
    }/authorize?${queryString.stringify(authorisationData)}`;
  }

  async goToAuthApp() {
    window.location.href = await this.generateAuthorisationUrl();
  }

  render() {
    const { t } = this.props;
    const slidesData = [
      {
        icon: 'private-and-protected',
        label: t('welcome_store-data_infotext-label'),
        text: t('welcome_store-data_infotext'),
      },
      {
        icon: 'scan',
        label: t('welcome_scan-printed_infotext-label'),
        text: t('welcome_scan-printed_infotext'),
      },
      {
        icon: 'globe',
        label: t('welcome_manage-docs_infotext-label'),
        text: t('welcome_manage-docs_infotext'),
      },
      {
        icon: 'share',
        label: t('welcome_view-edit-files_infotext-label'),
        text: t('welcome_view-edit-files_infotext'),
      },
      {
        icon: 'act-independent',
        label: t('welcome_share-health-info_infotext-label'),
        text: t('welcome_share-health-info_infotext'),
      },
    ];
    return (
      <ViewWrapper className="ViewWrapper--overview-page">
        <div className="OnboardingPage">
          <div>
            <d4l-card classes="card--text-center OnboardingPage__card">
              <div slot="card-header">
                <ViewHeader title={t('welcome_data4life_title')}></ViewHeader>
              </div>
              <div slot="card-content">
                <d4l-slider
                  /*
              // @ts-ignore */
                  ref={webComponentWrapper({
                    slides: slidesData,
                  })}
                />
              </div>
              <div slot="card-footer">
                <d4l-button
                  style={{
                    boxSizing: 'border-box',
                  }}
                  classes="button--block button--uppercase"
                  text={t('welcome_start_button')}
                  // @ts-ignore
                  ref={webComponentWrapper({
                    handleClick: () => this.goToAuthApp(),
                  })}
                  data-test="authorizeBtn"
                />
              </div>
            </d4l-card>
          </div>
          <d4l-divider />
          <Funding />
        </div>
      </ViewWrapper>
    );
  }
}

export default withRouter(connector(withTranslation()(OnboardingPage)));
