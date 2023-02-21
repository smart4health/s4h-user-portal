import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import ViewWrapper from '../../components/ViewWrapper';
import config from '../../config';
import { featureNames, Flags } from '../../config/flags';
import {
  selectHasSummaryData,
  selectIsSharingMode,
  selectViewportSize,
  ViewportSize,
} from '../../redux/globalsSlice';
import { connect } from '../../store';
import { RootState } from '../../types';
import webComponentWrapper from '../../utils/webComponentWrapper';
import {
  getPatient,
  selectHasPersonalData,
  selectPersonalDataIds,
} from '../MedicalHistory/reduxSlice';
import {
  getMedications,
  selectCurrentMedicationsIds,
  selectHasCurrentMedications,
  selectHasMedications,
} from '../Medication/reduxSlice';
import {
  addToSharingData,
  setActiveView,
  ShareableFeatures,
  ShareSteps,
} from '../Sharing/reduxSlice';
import AllergiesIntolerancesList from './AllergiesIntolerances';
import {
  fetchAllergiesIntolerances,
  selectAllAllergiesIntolerancesIds,
  selectHasAllergiesIntolerances,
} from './AllergiesIntolerances/reduxSlice';
import ConditionList from './Conditions';
import {
  fetchConditions,
  selectAllConditionIds,
  selectHasConditions,
} from './Conditions/reduxSlice';
import MedicationList from './Medications';
import PersonalData from './PersonalData';
import ScrollToTop from './ScrollToTop';
import './Summary.scss';
import TableOfContents from './TableOfContents';

interface Props {
  flags: Flags;
}

const Summary = (props: Props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const hasSummaryData = useSelector(selectHasSummaryData);
  const hasPersonalData = useSelector(selectHasPersonalData);
  const hasConditions = useSelector(selectHasConditions);
  const hasMedications = useSelector(selectHasMedications);
  const hasCurrentMedications = useSelector(selectHasCurrentMedications);
  const hasAllergiesIntolerances = useSelector(selectHasAllergiesIntolerances);

  const allPersonalDataIds = useSelector(selectPersonalDataIds);
  const currentMedicationIds = useSelector(selectCurrentMedicationsIds);
  const allAllergiesIntolerancesIds = useSelector(selectAllAllergiesIntolerancesIds);
  const allConditionIds = useSelector(selectAllConditionIds);

  const viewportSize = useSelector(selectViewportSize);
  const isSharingMode = useSelector(selectIsSharingMode);
  const [isShowingScrollToTop, setIsShowingScrollToTop] = useState(false);

  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const flags = props.flags;

  const isNotificationBarShown =
    !isSharingMode &&
    (hasCurrentMedications || hasAllergiesIntolerances || hasConditions);

  const isPersonalDataCardShown =
    !isSharingMode || (isSharingMode && hasPersonalData);

  const isNarrowView = viewportSize === ViewportSize.NARROW;

  const moreThanOneCardVisible =
    Number(isPersonalDataCardShown) +
      Number(hasCurrentMedications) +
      Number(hasConditions) +
      Number(hasAllergiesIntolerances) >
    1;

  const isTableOfContentsShown =
    isNarrowView && (!isSharingMode || moreThanOneCardVisible);

  const isLeftColumnShown =
    isTableOfContentsShown || isPersonalDataCardShown || hasCurrentMedications;

  const isRightColumnShown = hasConditions || hasAllergiesIntolerances;

  useEffect(() => {
    const scrollableElement = document.querySelector('.AppWrapper')!;

    const handleScroll = () => {
      const footerHeight =
        document.querySelector<HTMLDivElement>('.ViewWrapper__footer')
          ?.offsetHeight || 0;
      const headerHeight =
        document.querySelector<HTMLDivElement>('.ViewWrapper__header')
          ?.offsetHeight || 0;
      const viewportHeight = window.innerHeight - headerHeight - footerHeight;
      const currentScrollPosition = scrollableElement.scrollTop;
      if (currentScrollPosition > viewportHeight) {
        setIsShowingScrollToTop(true);
      } else {
        setIsShowingScrollToTop(false);
      }
    };

    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);

      return () => scrollableElement.removeEventListener('scroll', handleScroll);
    }
  }, [viewportSize]);

  useEffect(
    function fetchData() {
      const dataFetchActions = [];

      (async () => {
        if (!hasPersonalData) {
          dataFetchActions.push(dispatch(getPatient()));
        }
        if (!hasConditions) {
          dataFetchActions.push(dispatch(fetchConditions()));
        }
        if (!hasAllergiesIntolerances && flags[featureNames.MEDICATION]) {
          dataFetchActions.push(dispatch(fetchAllergiesIntolerances()));
        }
        if (!hasMedications && flags[featureNames.MEDICATION]) {
          dataFetchActions.push(dispatch(getMedications(i18n.language)));
        }
        await Promise.allSettled(dataFetchActions);
        setIsLoadingData(false);
      })();
    },
    [
      dispatch,
      flags,
      i18n,
      hasPersonalData,
      hasConditions,
      hasAllergiesIntolerances,
      hasMedications,
    ]
  );
  const summaryClasses = classNames('Summary', {
    'Summary--is-loading': isLoadingData,
    'Summary--is-centered': !isRightColumnShown,
  });

  const tocItems = [];
  moreThanOneCardVisible &&
    isPersonalDataCardShown &&
    tocItems.push({ id: 'personal-data', title: 'anamnesis:personal_data' });
  moreThanOneCardVisible &&
    hasCurrentMedications &&
    tocItems.push({
      id: 'medications',
      title: 'patient_summary.medications_card.title',
    });
  moreThanOneCardVisible &&
    hasAllergiesIntolerances &&
    tocItems.push({
      id: 'allergies-and-intolerances',
      title: 'patient_summary.allergies_and_intolerances_card.title',
    });
  moreThanOneCardVisible &&
    hasConditions &&
    tocItems.push({
      id: 'conditions',
      title: 'patient_summary.conditions_card.title',
    });

  const handleShareSummaryButtonClick = () => {
    batch(() => {
      dispatch(
        addToSharingData({
          type: ShareableFeatures.SUMMARY,
          ids: allPersonalDataIds,
        })
      );

      dispatch(
        addToSharingData({
          type: ShareableFeatures.MEDICATION,
          ids: currentMedicationIds,
        })
      );

      dispatch(
        addToSharingData({
          type: ShareableFeatures.ALLERGIES_INTOLERANCES,
          ids: allAllergiesIntolerancesIds,
        })
      );

      dispatch(
        addToSharingData({
          type: ShareableFeatures.CONDITIONS,
          ids: allConditionIds,
        })
      );

      dispatch(setActiveView(ShareSteps.PICKER));
    });

    history.push(config.ROUTES.app_share);
  };

  const topAlignedHeader =
    viewportSize !== ViewportSize.NARROW && !isSharingMode ? (
      <div className="Summary__share-bar" data-testid="summary-share-bar">
        <h1>{t('patient_summary.share_bar.title')}</h1>
        {hasSummaryData && (
          <d4l-button
            classes="button--large button--uppercase"
            text={t('patient_summary.share_bar.button')}
            // @ts-ignore
            ref={webComponentWrapper({
              handleClick: handleShareSummaryButtonClick,
            })}
            data-testid="summary-share-bar-button"
          />
        )}
      </div>
    ) : null;

  return (
    <ViewWrapper
      className="ViewWrapper--background-gray ViewWrapper--footer-gray ViewWrapper--body-and-footer-scroll ViewWrapper--align-top-centered ViewWrapper"
      contentClassName="ViewWrapper--aligned-top"
      topAlignedHeader={topAlignedHeader}
    >
      <div className={summaryClasses}>
        {isLoadingData ? (
          <div className="Summary__loader" data-testid="summary-spinner">
            <d4l-spinner />
          </div>
        ) : (
          <>
            <div className="Summary__columns">
              {isLeftColumnShown && (
                <div
                  className="Summary__left-column"
                  data-testid="summary-left-column"
                >
                  {isTableOfContentsShown && (
                    <div
                      className="Summary__entry"
                      data-testid="summary-table-of-content"
                    >
                      <TableOfContents
                        items={tocItems}
                        onShareSummaryClick={handleShareSummaryButtonClick}
                      />
                    </div>
                  )}
                  <div className="Summary__entry">
                    <PersonalData />
                  </div>
                  {hasCurrentMedications && flags[featureNames.MEDICATION] && (
                    <div
                      className="Summary__entry"
                      data-testid="medications-summary-card"
                    >
                      <MedicationList />
                    </div>
                  )}
                </div>
              )}
              {isRightColumnShown && flags[featureNames.MEDICATION] && (
                <div
                  className="Summary__right-column"
                  data-testid="summary-right-column"
                >
                  {hasAllergiesIntolerances && (
                    <div
                      className="Summary__entry"
                      data-testid="allergies-intolerances-summary-card"
                    >
                      <AllergiesIntolerancesList />
                    </div>
                  )}
                  {hasConditions && (
                    <div
                      className="Summary__entry"
                      data-testid="conditions-summary-card"
                    >
                      <ConditionList />
                    </div>
                  )}
                </div>
              )}
            </div>
            {isNotificationBarShown && flags[featureNames.MEDICATION] && (
              <div className="Summary__info" data-testid="summary-notification-bar">
                <d4l-notification-bar
                  classes="Summary_info-notification-bar"
                  text={t('patient_summary.notification_bar.infotext')}
                />
              </div>
            )}
            {isShowingScrollToTop && <ScrollToTop />}
          </>
        )}
      </div>
    </ViewWrapper>
  );
};

export default connect(({ flags }: RootState) => ({
  flags,
}))(Summary);
