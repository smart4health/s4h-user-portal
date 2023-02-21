import classNames from 'classnames';
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import config from '../../config';
import { featureNames } from '../../config/flags';
import { connect } from '../../store';
import { RootState, UserData } from '../../types';
import s4hLogo from './images/logo-s4h.svg';
import './NavHeader.scss';
import NavLinks, { HeaderLink } from './NavLinks/NavLinks';

const NAV_LINK_CONFIG: HeaderLink[] = [
  {
    id: 'summary',
    featureName: featureNames.SUMMARY,
    to: config.ROUTES.summary,
    title: 'summary',
  },
  {
    id: 'documents',
    featureName: featureNames.HEALTH_DATA,
    to: config.ROUTES.documents,
    title: 'documents',
  },
  {
    id: 'medications',
    featureName: featureNames.MEDICATION,
    to: config.ROUTES.medication,
    title: 'medication.headline.title',
  },
  {
    id: 'app_share',
    featureName: featureNames.SHARING,
    to: config.ROUTES.app_share,
    title: 'app_share',
  },
];

interface Props extends WithTranslation {
  userData: UserData;
}

type State = {
  isMobileNavOpen: boolean;
};

export class NavHeader extends Component<Props, State> {
  state = {
    isMobileNavOpen: false,
  };

  toggleMobileNavigation = () => {
    const { isMobileNavOpen } = this.state;
    this.setState({ isMobileNavOpen: !isMobileNavOpen });
    document.body.classList.toggle('isMobileNavOpen');
  };

  closeMobileNavigation = () => {
    this.setState({ isMobileNavOpen: false });
    document.body.classList.remove('isMobileNavOpen');
  };

  render() {
    const { t, userData } = this.props;
    const { isMobileNavOpen } = this.state;

    const burgerClasses = classNames('NavHeader__burger', {
      'NavHeader__burger--is-open': isMobileNavOpen,
    });

    const headerClasses = classNames('NavHeader', {
      'NavHeader--is-open': isMobileNavOpen,
    });

    return (
      <div className={headerClasses}>
        <div className="NavHeader__container">
          <div className="NavHeader__bar">
            <Link
              className="NavHeader__brand"
              to={config.ROUTES.dashboard}
              onClick={this.closeMobileNavigation}
              data-test="logo"
            >
              <img src={s4hLogo} alt="smart4health" />
            </Link>
            <button
              type="button"
              className={`${burgerClasses}`}
              onClick={this.toggleMobileNavigation}
              aria-expanded={isMobileNavOpen}
              aria-label={t('menu')}
              data-test="HeaderBurgerMenu"
            >
              <span className="NavHeader__burger-slice" />
              <span className="NavHeader__burger-slice" />
              <span className="NavHeader__burger-slice" />
            </button>
          </div>
          <NavLinks
            navLinks={NAV_LINK_CONFIG}
            isMobileNavOpen={isMobileNavOpen}
            handleLinkClick={this.closeMobileNavigation}
            userData={userData}
          />
        </div>
      </div>
    );
  }
}

export default connect(({ userData }: RootState) => ({
  userData,
}))(withTranslation()(NavHeader));
