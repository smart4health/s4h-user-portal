import { Attachment } from '@d4l/js-sdk';
import Button from '@material-ui/core/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectBrowser,
  selectIsSharingMode,
  selectPlatform,
} from '../../../../redux/globalsSlice';
import { selectProvenanceById } from '../../../../redux/provenanceSlice';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../../utils/analytics';
import {
  downloadFile,
  isImage,
  printDocument,
} from '../../../../utils/documentUtils';
import { showModal } from '../../../modals/modalsSlice';
import { ReactComponent as IconClock } from '../../images/clock.svg';
import { ReactComponent as FileDownload } from '../../images/FileDownload.svg';
import { ReactComponent as FileFullscreen } from '../../images/FileFullscreen.svg';
import { ReactComponent as FilePrint } from '../../images/FilePrint.svg';
import { selectActiveGroup } from '../../reduxSlice';
import './FileActionButtons.scss';

interface Props {
  fileObject: Attachment;
  toggleLightboxVisibility: (value: boolean) => void;
}

const FileActionButtons: React.FC<Props> = ({
  fileObject,
  toggleLightboxVisibility,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const group = useSelector(selectActiveGroup)!;
  const isSharing = useSelector(selectIsSharingMode);

  const provenanceList = useSelector(state => selectProvenanceById(state, group.id));

  const platform = useSelector(selectPlatform);
  const browser = useSelector(selectBrowser);

  const isFirefoxAndroid = platform === 'android' && browser === 'firefox';
  const isIOS3rdPartyBrowser = platform === 'ios' && browser !== 'safari';

  // firefoxAndroid and iOS (chrome) don't support printing
  const supportsPrinting = !isFirefoxAndroid && !isIOS3rdPartyBrowser;

  return (
    <div className="GroupItemFileActionButtons">
      {!isSharing && (
        <div className="GroupItemFileActionButtons__button">
          <Button
            disableRipple
            disabled={!provenanceList || provenanceList?.provenances.length === 0}
            aria-label={t('provenance.button.arialabel')}
            onClick={() => {
              dispatch(showModal({ type: 'ShowProvenance', options: {} }));
            }}
          >
            <IconClock />
          </Button>
        </div>
      )}
      {group?.groupType === 'Course' && (
        <div className="GroupItemFileActionButtons__button">
          <Button
            disableRipple
            aria-label={t('download')}
            onClick={() => {
              pushTrackingEvent(TRACKING_EVENTS.DOCUMENT_DOWNLOAD_START);
              downloadFile(fileObject);
            }}
          >
            <FileDownload />
          </Button>
        </div>
      )}
      {isImage(fileObject.contentType) && supportsPrinting && (
        <div className="GroupItemFileActionButtons__button">
          <Button
            disableRipple
            aria-label={t('print')}
            onClick={() => printDocument(fileObject.file)}
          >
            <FilePrint />
          </Button>
        </div>
      )}
      {isImage(fileObject.contentType) && (
        <div className="GroupItemFileActionButtons__button">
          <Button
            disableRipple
            aria-label={t('fullscreen')}
            onClick={() => {
              toggleLightboxVisibility(true);
              const { body } = document;
              body.requestFullscreen && body.requestFullscreen();
            }}
          >
            <FileFullscreen />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileActionButtons;
