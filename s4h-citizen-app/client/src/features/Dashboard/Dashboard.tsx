import React, { useCallback, useEffect, useState } from 'react';
// @ts-ignore
import { FeatureToggle } from 'react-feature-toggles';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ViewWrapper from '../../components/ViewWrapper';
import config from '../../config';
import { featureNames, Flags } from '../../config/flags';
import { fetchDataOnAppInit } from '../../redux/globalsSlice';
import { connect } from '../../store';
import { RootState } from '../../types';
import {
  selectHasHealthData,
  selectLastAddedDocumentGroupTitle,
} from '../DocumentsViewer/reduxSlice';
import { editingForm, selectHasMedicalHistory } from '../MedicalHistory/reduxSlice';
import {
  selectAllMedications,
  selectCurrentMedications,
  selectHasMedications,
} from '../Medication/reduxSlice';
import { showModal } from '../modals/modalsSlice';
import {
  selectHasShareableData,
  setActiveView,
  ShareSteps,
} from '../Sharing/reduxSlice';
import { selectIsAllergiesIntolerancesEmpty } from '../Summary/AllergiesIntolerances/reduxSlice';
import { selectIsConditionsEmpty } from '../Summary/Conditions/reduxSlice';
import DashboardCard from './Card';
import CardContent from './CardContent';
import './Dashboard.scss';
import { ReactComponent as IconDocument } from './images/icon_document.svg';
import { ReactComponent as IconDonation } from './images/icon_donation.svg';
import { ReactComponent as IconMedication } from './images/icon_medication.svg';
import { ReactComponent as IconSharing } from './images/icon_sharing.svg';
import { ReactComponent as IconSummary } from './images/icon_summary.svg';
import { ReactComponent as IconDataIngestion } from './images/icon_data_ingestion.svg';

interface Props extends RouteComponentProps {
  appInitialized: boolean;
  flags: Flags;
}

export const Dashboard = (props: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { history, appInitialized } = props;
  const { ROUTES } = config;
  const latestGroupTitle = useSelector(selectLastAddedDocumentGroupTitle);
  const isHealthDataAvailable = useSelector(selectHasHealthData);
  const isShareableDataAvailable = useSelector(selectHasShareableData);
  const isMedicationsAvailable = useSelector(selectHasMedications);
  const currentMedications = useSelector(selectCurrentMedications);
  const isCurrentMedicationsAvailable = currentMedications.length > 0;
  const isConditionsEmpty = useSelector(selectIsConditionsEmpty);
  const isAllergiesIntolerancesEmpty = useSelector(
    selectIsAllergiesIntolerancesEmpty
  );
  const medications = useSelector(selectAllMedications);
  const hasMedicalHistory = useSelector(selectHasMedicalHistory);
  const flags = props.flags;

  const isSummaryDataAvailable =
    hasMedicalHistory ||
    isCurrentMedicationsAvailable ||
    !isConditionsEmpty ||
    !isAllergiesIntolerancesEmpty;

  const handleShareCardClick = useCallback(() => {
    history.push(ROUTES.app_share);
    dispatch(setActiveView(ShareSteps.PICKER));
  }, [ROUTES.app_share, dispatch, history]);

  const handleLearnMoreClick = () => {
    window.open('https://smart4health.eu/myscience', '_blank');
  };

  useEffect(() => {
    (async () => {
      await dispatch(fetchDataOnAppInit());
      setIsLoading(false);
    })();
  }, [dispatch]);

  const latestMedicationName =
    medications[0]?.code.resolvedText ?? t('medication.description.infotext');

  return (
    <ViewWrapper className="ViewWrapper--background-gray ViewWrapper--body-and-footer-scroll">
      {isLoading ? (
        <div>
          <d4l-spinner />
        </div>
      ) : (
        <div className="Dashboard">
          <div className="Dashboard__title-container">
            <div className="Dashboard__title">{t('hero_dashboard_title')}</div>
            <div className="Dashboard__sub-title">{t('hero_dashboard_text')}</div>
          </div>
          <div className="Dashboard__cards">
            <FeatureToggle featureName={featureNames.MEDICATION}>
              <DashboardCard
                title={t('overview.card_patient_summary.title')}
                subTitle={t('overview.card_patient_summary.subtitle')}
                primaryButton={{
                  text: isSummaryDataAvailable
                    ? t('overview.card_patient_summary.button')
                    : t('overview.card_patient_summary_empty.button'),
                  action: () => {
                    if (!isSummaryDataAvailable) {
                      dispatch(editingForm(true));
                    }
                    history.push({
                      pathname: ROUTES.summary,
                    });
                  },
                  dataTest: 'personalSummaryButton',
                }}
                data-test="personalSummaryCard"
              >
                <CardContent
                  icon={<IconSummary />}
                  label={
                    isSummaryDataAvailable
                      ? t('overview.card_patient_summary.infotext')
                      : t('overview.card_patient_summary_empty.infotext')
                  }
                  isLoading={!appInitialized}
                  isActive={isSummaryDataAvailable}
                />
              </DashboardCard>
            </FeatureToggle>
            <FeatureToggle featureName={featureNames.HEALTH_DATA}>
              <DashboardCard
                title={t('overview.card_health_data.title')}
                subTitle={t('view_and_manage_your_health_data')}
                primaryButton={{
                  text: t('overview.card_health_data_add_document_action.button'),
                  action: () => {
                    history.push({
                      pathname: ROUTES.documents,
                    });
                    dispatch(showModal({ type: 'AddGroup', options: {} }));
                  },
                  dataTest: 'addDocumentBtn',
                }}
                {...(isHealthDataAvailable && {
                  secondaryButton: {
                    text: t('view_all'),
                    action: () => history.push(ROUTES.documents),
                    dataTest: 'ViewAllDocumentsBtn',
                  },
                })}
                data-test="card"
              >
                <CardContent
                  icon={<IconDocument />}
                  label={
                    isHealthDataAvailable ? t('last_uploaded') : t('no_documents')
                  }
                  isLoading={!appInitialized}
                  isActive={isHealthDataAvailable}
                  latestItemTitle={latestGroupTitle}
                />
              </DashboardCard>
            </FeatureToggle>
            <FeatureToggle featureName={featureNames.MEDICATION}>
              <DashboardCard
                title={t('overview.card_medication.title')}
                subTitle={t('overview.card_medication.subtitle')}
                {...(isMedicationsAvailable && {
                  primaryButton: {
                    text: t('view_all'),
                    dataTest: 'viewMedicationBtn',
                    action: () =>
                      history.push({
                        pathname: ROUTES.medication,
                      }),
                  },
                })}
                noCardActionText={t('overview.card_medication_no_medication.footer')}
              >
                <CardContent
                  icon={<IconMedication />}
                  label={
                    isMedicationsAvailable
                      ? t('overview.card_medication.message')
                      : t('overview.card_medication_no_medication.infotext')
                  }
                  latestItemTitle={
                    isMedicationsAvailable ? latestMedicationName : ''
                  }
                  isLoading={!appInitialized}
                  isActive={isMedicationsAvailable}
                />
              </DashboardCard>
            </FeatureToggle>
            <FeatureToggle featureName={featureNames.SHARING}>
              <DashboardCard
                title={t('share_records')}
                subTitle={t('share_records_intro')}
                {...(isShareableDataAvailable && {
                  primaryButton: {
                    text: t('start_sharing'),
                    action: handleShareCardClick,
                    dataTest: 'StartSharingBtn',
                  },
                })}
                noCardActionText={t('overview.health_data_card_no_data_text.footer')}
              >
                <CardContent
                  icon={<IconSharing />}
                  label={
                    flags[featureNames.MEDICATION]
                      ? t('overview.card_sharing_medication_enabled.infotext')
                      : t('overview.card_sharing_medication_disabled.infotext')
                  }
                  isLoading={!appInitialized}
                  isActive={isShareableDataAvailable}
                />
              </DashboardCard>
            </FeatureToggle>
            <FeatureToggle featureName={featureNames.DATA_DONATION}>
              <DashboardCard
                title={t('overview.card_data_donation.title')}
                subTitle={t('overview.card_data_donation.subtitle')}
                {...{
                  primaryButton: {
                    text: t('overview.card_data_donation.button'),
                    action: handleLearnMoreClick,
                    dataTest: 'LearnMoreBtn',
                  },
                }}
              >
                <CardContent
                  icon={<IconDonation />}
                  label={t('overview.card_data_donation.infotext')}
                  isLoading={!appInitialized}
                  isActive={true}
                />
              </DashboardCard>
            </FeatureToggle>
            <DashboardCard
              title={t('overview.card_data_ingestion.title')}
              subTitle={t('overview.card_data_ingestion.subtitle')}
              primaryButton={{
                text: t('overview.card_data_ingestion.button'),
                action: () => {
                  history.push({
                    pathname: ROUTES.support_data_ingestion,
                  });
                },
                dataTest: 'dataIngestionButton',
              }}
              data-test="dataIngestionCard"
            >
              <CardContent
                icon={<IconDataIngestion />}
                label={t('overview.card_data_ingestion.infotext')}
                isActive
              />
            </DashboardCard>
          </div>
        </div>
      )}
    </ViewWrapper>
  );
};

export default withRouter(
  connect(({ appInitialized, flags }: RootState) => ({
    appInitialized,
    flags,
  }))(Dashboard)
);
