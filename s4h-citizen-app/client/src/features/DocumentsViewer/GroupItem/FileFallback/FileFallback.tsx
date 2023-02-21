import { Attachment } from '@d4l/js-sdk';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { downloadFile } from '../../../../utils/documentUtils';
import './FileFallback.scss';

interface Props {
  fileObject: Attachment;
}

const FileFallback: React.FC<Props> = ({ fileObject }) => {
  const { t } = useTranslation();

  return (
    <div className="GroupItemFileFallback">
      <div className="GroupItemFileFallback__no-preview-text-box">
        <h3>{t('no_preview_heading')}</h3>
        <p>
          <Trans i18nKey="no_preview_paragraph">
            We can't show you a preview for files with .tiff or .dcm extension, but
            you can
            <button
              onClick={() => downloadFile(fileObject)}
              className="GroupItemFileFallback__no-preview-download-button"
            >
              download
            </button>
            it to visualise it on your computer.
          </Trans>
        </p>
      </div>
    </div>
  );
};

export default FileFallback;
