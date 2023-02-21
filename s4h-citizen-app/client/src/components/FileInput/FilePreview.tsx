import React from 'react';
import { isImage, isPDF } from '../../utils/documentUtils';
import FileDocumentIcon from './images/file-document.svg';
import PDFDocumentIcon from './images/file-pdf-box.svg';

export interface FilePreviewProps {
  file: File;
  imagePreview?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, imagePreview }) => {
  let preview: string | undefined = FileDocumentIcon;
  if (isImage(file.type)) {
    preview = imagePreview;
  } else if (isPDF(file.type)) {
    preview = PDFDocumentIcon;
  }

  return (
    <div className="FileInput__preview">
      <button className="FileInput__preview-image" type="button">
        <img src={preview} alt="" />
      </button>
      <div className="FileInpuyt__preview-title" title={file.name}>
        {file.name}
      </div>
    </div>
  );
};

export default FilePreview;
