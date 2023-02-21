import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import { showModal } from '../../modals/modalsSlice';
import '../Profile.scss';

const MyDataForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const handleDownloadClick = useCallback(() => {
    dispatch(
      showModal({
        type: 'DownloadData',
        options: {
          title: t('download_all_Data'),
        },
      })
    );
  }, [dispatch, t]);

  return (
    <div className="ProfileForm">
      <d4l-card classes="ProfileForm__card">
        <div slot="card-content">
          <div className="ProfileForm__section">
            <h3>{t('your_data')}</h3>
          </div>
          <p>{t('export_all_documents')}</p>
          {/* eslint-disable jsx-a11y/anchor-is-valid  */}
          <d4l-button
            classes="button--block button--secondary button--uppercase ProfileForm__button"
            text={t('download')}
            data-test="downloadBtn"
            // @ts-ignore
            ref={webComponentWrapper({
              handleClick: handleDownloadClick,
            })}
          />
        </div>
      </d4l-card>
    </div>
  );
};

export default MyDataForm;
