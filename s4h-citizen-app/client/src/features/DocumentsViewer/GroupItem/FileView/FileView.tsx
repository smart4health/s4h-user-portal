import { Attachment } from '@d4l/js-sdk';
import { FileGroupItem } from '@d4l/s4h-fhir-xforms';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux';
import {
  getMimeType,
  isPDF,
  isPreviewableImage,
} from '../../../../utils/documentUtils';
import { selectFileById } from '../../reduxSlice';
import FileActionButtons from '../FileActionButtons';
import FileFallback from '../FileFallback';
import ImageView from '../ImageView';
import PDFView from '../PDFView';
import './FileView.scss';

export interface Props {
  groupItem: FileGroupItem;
}

const FileView: React.FunctionComponent<Props> = props => {
  const { groupItem } = props;
  const [isLightboxVisible, setIsLightboxVisible] = useState<boolean>(false);
  const fileObject = useSelector<AppState, Attachment | undefined>(state =>
    selectFileById(state, groupItem.fileId)
  );

  const isLoading = useSelector<AppState, boolean>(state => {
    return state.documentsViewer.isLoadingFile;
  });

  if (!fileObject || isLoading) {
    return (
      <div className="GroupItemFileView">
        <div className="GroupItemFileView__loading-spinner-container">
          <d4l-spinner classes="GroupItemFileView__loading-spinner" />
        </div>
      </div>
    );
  }

  const fileData = fileObject.file;

  const fileContentType = getMimeType(fileData);

  return (
    <div className="GroupItemFileView">
      {isPreviewableImage(fileContentType) ? (
        <>
          <ImageView
            fileData={fileData}
            toggleLightboxVisibility={setIsLightboxVisible}
            isLightboxVisible={isLightboxVisible}
          />
          <FileActionButtons
            fileObject={fileObject}
            toggleLightboxVisibility={setIsLightboxVisible}
          />
        </>
      ) : isPDF(fileContentType) ? (
        <>
          <PDFView fileData={fileData} />
          <FileActionButtons
            fileObject={fileObject}
            toggleLightboxVisibility={setIsLightboxVisible}
          />
        </>
      ) : (
        <FileFallback fileObject={fileObject} />
      )}
    </div>
  );
};

export default FileView;
