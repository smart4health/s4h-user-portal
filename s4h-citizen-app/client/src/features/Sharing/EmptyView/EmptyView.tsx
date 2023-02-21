import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { EmptyState, TitleCaption } from '../../../components';
import { emptyStateButtonClasses } from '../../../components/EmptyState/EmptyState';
import config from '../../../config';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import { editingForm } from '../../MedicalHistory/reduxSlice';
import { showModal } from '../../modals/modalsSlice';
import { ReactComponent as SharingEmpty } from '../images/sharing.svg';

interface Props extends RouteComponentProps {}

const EmptyView = ({ history }: Props) => {
  const { t } = useTranslation(['master', 'sharing']);
  const dispatch = useDispatch();
  const { ROUTES } = config;
  const handleMedicalHistoryClick = () => {
    dispatch(editingForm(true));
    history.push({
      pathname: ROUTES.summary,
    });
  };

  return (
    <div className="Sharing--empty">
      <EmptyState
        header={
          <TitleCaption
            title={t('master:sharing_empty_state_title')}
            subtitle={t('master:sharing_empty_state_subtitle')}
          />
        }
        content={<SharingEmpty />}
        footer={
          <>
            <d4l-button
              classes={emptyStateButtonClasses}
              text={t('sharing:landing_page_enter_data.button')}
              // @ts-ignore
              ref={webComponentWrapper({
                handleClick: handleMedicalHistoryClick,
              })}
              data-test="AddMedicalHistoryBtn"
            />

            <d4l-button
              classes={emptyStateButtonClasses}
              text={t('sharing:landing_page_upload.button')}
              // @ts-ignore
              ref={webComponentWrapper({
                handleClick: () => {
                  history.push({
                    pathname: ROUTES.documents,
                  });
                  dispatch(showModal({ type: 'AddGroup', options: {} }));
                },
              })}
              data-test="AddDocumentBtn"
            />
          </>
        }
      />
    </div>
  );
};

export default withRouter(EmptyView);
