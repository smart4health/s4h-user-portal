/** Renders both the mobile and desktop version of navigation links */

import classnames from 'classnames';
import React, { MouseEventHandler, useCallback } from 'react';
// @ts-ignore
import { FeatureToggle } from 'react-feature-toggles';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import config from '../../../config';
import { FeatureNamesValues } from '../../../config/flags';
import { showModal } from '../../../features/modals/modalsSlice';
import { UserData } from '../../../types';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../utils/analytics';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import HeaderLangComponent from '../../HeaderLang';
import { ReactComponent as IconUser } from '../images/icon-user.svg';
import './NavLinks.scss';

export type ConfigRouteKeys = keyof typeof config.ROUTES;
export type ConfigRouteValues = typeof config.ROUTES[ConfigRouteKeys];

export type HeaderLink = {
  id: string;
  featureName: FeatureNamesValues;
  to: ConfigRouteValues;
  title: string;
};
interface Props {
  handleLinkClick: MouseEventHandler<HTMLAnchorElement>;
  userData?: UserData;
  isMobileNavOpen: boolean;
  navLinks: HeaderLink[];
  isSharing?: boolean;
}

const NavLinks = (props: Props) => {
  const isSharing = !!props.isSharing;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onDownloadClick = useCallback(() => {
    pushTrackingEvent(TRACKING_EVENTS.SHAREE_VIEW_DOWNLOAD_DATA);
    dispatch(
      showModal({
        type: 'DownloadData',
        options: {
          title: t('sharing.download_patient_data_modal.title'),
        },
      })
    );
  }, [dispatch, t]);

  const NavClasses = classnames('NavLinks', {
    'NavLinks--is-active': props.isMobileNavOpen,
  });

  const renderNavLink = (navLink: HeaderLink) => (
    <li key={navLink.id} className="NavLinks__item">
      <NavLink
        to={navLink.to}
        title={t(navLink.title)}
        className="NavLinks__link"
        activeClassName="NavLinks__link--is-active"
        onClick={props.handleLinkClick}
      >
        {t(navLink.title)}
      </NavLink>
    </li>
  );

  const renderLinks = () => {
    if (isSharing) {
      return props.navLinks.map(navLink => renderNavLink(navLink));
    }
    return (
      <>
        {props.navLinks.map(navLink => (
          <FeatureToggle key={navLink.id} featureName={navLink.featureName}>
            {renderNavLink(navLink)}
          </FeatureToggle>
        ))}
        <li className="NavLinks__item">
          <a
            rel="noopener"
            className="NavLinks__link"
            href="mailto:feedback@smart4health.eu"
          >
            {t('feedback')}
          </a>
        </li>
      </>
    );
  };

  return (
    <div className={NavClasses}>
      <ul className="NavLinks__items">{renderLinks()}</ul>
      <ul className="NavLinks__items NavLinks__items--user">
        {props.userData && (
          <li className="NavLinks__item">
            <NavLink
              to={config.ROUTES.profile}
              className="NavLinks__link"
              activeClassName="is-active"
              /*
            // @ts-ignore */
              onClick={props.handleLinkClick}
              data-test="Profile"
            >
              <span className="NavLinks__user-icon">
                <IconUser />
              </span>
              <span className="NavLinks__user-name">{props.userData.email}</span>
            </NavLink>
          </li>
        )}
        {isSharing && (
          <d4l-button
            class="NavLinks__download-data-button"
            classes="button--uppercase button--large"
            text="Download"
            // @ts-ignore TS-FIXME
            ref={webComponentWrapper({
              handleClick: onDownloadClick,
            })}
            data-testid="navigation-download-data-button"
          />
        )}
        <HeaderLangComponent />
      </ul>
    </div>
  );
};

export default NavLinks;
