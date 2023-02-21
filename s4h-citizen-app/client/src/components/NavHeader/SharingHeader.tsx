import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useTranslation, WithTranslation, withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import config from '../../config';
import { featureNames } from '../../config/flags';
import { selectHasHealthData } from '../../features/DocumentsViewer/reduxSlice';
import { selectHasMedications } from '../../features/Medication/reduxSlice';
import { selectHasSummaryData, selectIsSharingMode } from '../../redux/globalsSlice';
import { connect } from '../../store';
import { RootState } from '../../types';
import s4hLogo from './images/logo-s4h.svg';
import './NavHeader.scss';
import NavLinks, { HeaderLink } from './NavLinks/NavLinks';

type LinkConfigType = {
  [key: string]: HeaderLink;
};

const NAV_LINK_CONFIG: LinkConfigType = {
  summary: {
    id: 'summary',
    featureName: featureNames.SUMMARY,
    to: config.ROUTES.shared_summary,
    title: 'summary',
  },
  healthData: {
    id: 'documents',
    featureName: featureNames.HEALTH_DATA,
    to: config.ROUTES.shared_documents,
    title: 'documents',
  },
  medication: {
    id: 'medications',
    featureName: featureNames.MEDICATION,
    to: config.ROUTES.shared_medication,
    title: 'medication.headline.title',
  },
};

interface Props extends WithTranslation {}

export const NavHeader: React.FC<Props> = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { t } = useTranslation();
  const isSharing = useSelector(selectIsSharingMode);
  const isHavingHealthData = useSelector(selectHasHealthData);
  const isHavingSummaryData = useSelector(selectHasSummaryData);
  const isHavingMedications = useSelector(selectHasMedications);

  const toggleMobileNavigation = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
    document.body.classList.toggle('isMobileNavOpen');
  };

  const closeMobileNavigation = useCallback(() => {
    setIsMobileNavOpen(false);
    document.body.classList.remove('isMobileNavOpen');
  }, []);

  const burgerClasses = classNames('NavHeader__burger', {
    'NavHeader__burger--is-open': isMobileNavOpen,
  });
  const headerClasses = classNames('NavHeader', {
    'NavHeader--is-open': isMobileNavOpen,
  });

  const filteredNavLinks = [];
  if (isHavingSummaryData) {
    filteredNavLinks.push(NAV_LINK_CONFIG.summary);
  }
  if (isHavingHealthData) {
    filteredNavLinks.push(NAV_LINK_CONFIG.healthData);
  }
  if (isHavingMedications) {
    filteredNavLinks.push(NAV_LINK_CONFIG.medication);
  }

  return (
    <div className={headerClasses}>
      <div className="NavHeader__container">
        <div className="NavHeader__bar">
          <div className="NavHeader__brand" data-test="logo">
            <img src={s4hLogo} alt="smart4health" />
          </div>
          <button
            type="button"
            className={`${burgerClasses}`}
            onClick={toggleMobileNavigation}
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
          navLinks={filteredNavLinks}
          isMobileNavOpen={isMobileNavOpen}
          handleLinkClick={closeMobileNavigation}
          isSharing={isSharing}
        />
      </div>
    </div>
  );
};

export default connect(({ userData }: RootState) => ({
  userData,
}))(withTranslation()(NavHeader));
