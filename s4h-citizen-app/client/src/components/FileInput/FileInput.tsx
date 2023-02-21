import FileUpload from '@material-ui/icons/CloudUploadOutlined';
import classNames from 'classnames';
import React from 'react';
// @ts-ignore
import { FileRejection, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import './FileInput.scss';
import FilePreview from './FilePreview';

export interface FileInputProps {
  acceptedFiles: File[];
  className?: string;
  multiple?: boolean;
  onDropRejected?: (fileRejections: FileRejection[]) => void;
  onDropFiles: (files: File[]) => void;
}

const FileInput: React.FC<FileInputProps> = ({
  acceptedFiles,
  className,
  multiple,
  onDropRejected,
  onDropFiles,
}) => {
  const { t } = useTranslation();

  const props = {
    maxSize: 20000000,
    onDropRejected: onDropRejected,
    activeClassName: 'FileInput--active',
    accept: '.jpg,.jpeg,.png,.pdf,.tiff,.dcm',
    multiple,
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropFiles,
    ...props,
  });

  return (
    <div
      className={classNames(
        'FileInput',
        { 'FileInput--empty': acceptedFiles.length === 0 },
        className
      )}
      {...getRootProps()}
    >
      {acceptedFiles.map(file => (
        <FilePreview file={file} key={file.name} />
      ))}
      {acceptedFiles.length === 0 && <FileUpload />}
      <p>
        <strong>{t('choose_file')}</strong>
        {` ${t('drag_file')}`}
      </p>
      <input {...getInputProps()}></input>
    </div>
  );
};

export default FileInput;
