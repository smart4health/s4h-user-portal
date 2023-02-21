import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import config from '../../config';
import './Footer.scss';

// isUnAuthorizedView covers all the views which are viewable unauthorized
// Eg: landing page, external shared view

const FooterComponent = () => {
  const { t } = useTranslation();
  const routeMatch = useRouteMatch();
  const location = useLocation();

  const FooterClasses = classNames('Footer', {
    'Footer--landing': location.pathname === config.ROUTES.home,
  });
  const isExternalSharedView = routeMatch.path === config.ROUTES.share;
  return (
    <div className={FooterClasses}>
      <div className="Footer__container">
        <div className="Footer__links">
          <Link
            className="Footer__link"
            to={{
              pathname: config.ROUTES.legal_imprint,
              search: window.location.search,
            }}
          >
            {t('imprint')}
          </Link>
          <Link
            className="Footer__link"
            to={{
              pathname: config.ROUTES.legal_terms,
              search: window.location.search,
            }}
          >
            {t('legal')}
          </Link>
          {!isExternalSharedView && (
            <Link className="Footer__link" to={config.ROUTES.support}>
              {t('support')}
            </Link>
          )}
        </div>
        <div className="Footer__credits">
          <p>{t('all_rights_reserved', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </div>
  );
};

export default FooterComponent;
