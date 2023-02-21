import { Attachment } from '@d4l/js-sdk';
import mime from 'mime-types';

const determineFilenameForFileGroupItem = (fileAttachment: Attachment) => {
  let filename = ['Document', fileAttachment.id, fileAttachment.title]
    .filter(Boolean)
    .join(' ');

  // At this point filename might already contain a file extension (originating)
  // from the title part, but in case it doesn't we have to append the correct one.
  // Here's the precedence rules:
  // * If title contains an extension take it
  // * If title does not contain an extension fall back to contentType
  // * If contentType does not exist fall back to the data URL
  // * Exceptional case: title contains an extension but it does not match the one
  //   in contentType. In that case contentType takes precedence
  const extensionFromTitle = filename.match(/\.[^.]+$/)?.[0];

  if (!extensionFromTitle) {
    if (fileAttachment.contentType) {
      const determinedFileExtension = mime.extension(fileAttachment.contentType);
      if (determinedFileExtension) {
        filename += `.${determinedFileExtension}`;
      }
    } else {
      const mimeType = fileAttachment.file.substring(
        fileAttachment.file.indexOf(':') + 1,
        fileAttachment.file.indexOf(';')
      );
      const determinedFileExtension = mime.extension(mimeType || '');
      if (determinedFileExtension) {
        filename += `.${determinedFileExtension}`;
      } else {
        console.error('Could not determine file extension');
      }
    }
  } else {
    if (fileAttachment.contentType) {
      const extensionFromContenType = mime.extension(fileAttachment.contentType);
      const extensionsDoNotMatch = extensionFromTitle !== extensionFromContenType;
      if (extensionsDoNotMatch) {
        filename = filename
          .split('.')
          .slice(0, -1)
          .join('')
          .concat('.' + extensionFromContenType);
      }
    }
  }

  return filename;
};

export default determineFilenameForFileGroupItem;
