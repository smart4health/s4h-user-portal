import { Attachment } from '@d4l/js-sdk';
import { FileGroupItem } from '@d4l/s4h-fhir-xforms';
import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux';
import {
  getMimeType,
  getTypeShort,
  isPreviewableImage,
} from '../../../utils/documentUtils';
import { ReactComponent as FilePreviewNoThumb } from '../images/FilePreviewNoThumb.svg';
import { selectFileById } from '../reduxSlice';
import ThumbnailButton from './ThumbnailButton';

interface Props {
  groupItem: FileGroupItem;
  isActive: boolean;
  isLarger?: boolean;
  isSquare?: boolean;
  onSelect: () => void;
  isButton?: boolean;
}

const FileThumbnail: React.FC<Props> = ({
  groupItem,
  isActive,
  isLarger,
  isSquare,
  onSelect,
  isButton = false,
}) => {
  const fileAttachment = useSelector<AppState, Attachment | undefined>(state =>
    selectFileById(state, groupItem.fileId)
  );
  const isLoadingFile = useSelector<AppState, boolean | undefined>(
    state => state.documentsViewer.isLoadingFile
  );

  if (isLoadingFile) {
    return (
      <ThumbnailButton
        className={'GroupItemThumbnail--loading'}
        isActive={isActive}
        isLarger={isLarger}
        isSquare={isSquare}
        isButton={isButton}
      >
        <d4l-spinner classes="GroupItemThumbnail__loader" />
      </ThumbnailButton>
    );
  }

  if (!fileAttachment) {
    // TODO Image loading failed => Return sensible fallback here
    return null;
  }

  const contentType = getMimeType(fileAttachment);
  const isThumbnailAvailable = isPreviewableImage(contentType);

  const className = classNames({
    'GroupItemThumbnail--image': isThumbnailAvailable,
    'GroupItemThumbnail--has-label': !isThumbnailAvailable,
  });

  return (
    <ThumbnailButton
      className={className}
      isActive={isActive}
      isLarger={isLarger}
      isSquare={isSquare}
      mimeTypeShort={contentType ? getTypeShort(contentType) : undefined}
      onClick={onSelect}
      title={fileAttachment.title}
      isButton={isButton}
    >
      {isThumbnailAvailable ? (
        <img src={fileAttachment.file} alt="" />
      ) : (
        <FilePreviewNoThumb />
      )}
    </ThumbnailButton>
  );
};

export default FileThumbnail;
