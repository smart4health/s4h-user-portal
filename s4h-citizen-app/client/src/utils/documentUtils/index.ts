import { Attachment } from '@d4l/js-sdk';
import base64ToBlob from 'b64-to-blob';
import { actions } from '../../store';
import { DocumentAttachment } from '../../types';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../utils/analytics';
import isBrowser from '../isBrowser';
import { convertSDKDocumentToDocument } from './convertDocument';

export { convertSDKDocumentToDocument };

export const createDuplicateName = (
  numberOfExisting: number,
  compareItem: string
) => {
  if (numberOfExisting > 0) {
    const patternForExtension = /\.[0-9a-z]+$/i;
    // There was an issue where when the record.title was undefined. we conditionally check
    const matchesForExtension = compareItem?.match(patternForExtension);

    let newName = compareItem;
    let extension = '';
    if (matchesForExtension) {
      extension = matchesForExtension[0];
      newName = compareItem.split(extension)[0];
    }

    return `${newName}(${numberOfExisting})${extension}`;
  }
  return compareItem;
};

const getMimeTypeFromBase64 = (base64String: string) => {
  let result;
  const mime = base64String.match(/data:([a-zA-Z0-9]+\/?[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
};

export const getMimeType = (fileDataOrAttachment: string | Attachment) => {
  if (typeof fileDataOrAttachment === 'string') {
    return getMimeTypeFromBase64(fileDataOrAttachment);
  }
  if (fileDataOrAttachment.contentType && fileDataOrAttachment.contentType !== '') {
    return fileDataOrAttachment.contentType;
  }
  if (fileDataOrAttachment.file) {
    return getMimeTypeFromBase64(fileDataOrAttachment.file);
  }
};

export const isImage = (type: string | null | undefined) => {
  if (!type) {
    return false;
  }

  const supportedTypes = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'jpg',
    'jpeg',
    'png',
  ];
  return supportedTypes.includes(type);
};

export const isPreviewableImage = (type: string | null | undefined) => {
  if (!type) {
    return false;
  }

  const supportedTypes = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'jpg',
    'jpeg',
    'png',
  ];
  return supportedTypes.includes(type);
};

export const isPDF = (type: string | null | undefined) =>
  type && type === 'application/pdf';

export const getTypeShort = (type: string) => String(type).split('/').pop();

export function dataURLtoFile(dataUrl: string, filename: string) {
  const [rawMimeType, rawContent] = dataUrl.split(',');
  // @ts-ignore
  const mime = rawMimeType.match(/:(.*?);/)[1];
  const byteString = atob(rawContent);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i += 1) {
    uintArray[i] = byteString.charCodeAt(i);
  }
  return new File([uintArray], filename, { type: mime });
}

/**
 * @param {Object} attachment - creates a new type named 'attachment'
 * @param {string} attachment.file
 * @param {string} attachment.id
 * @param {string} attachment.title
 * @param {string} attachment.contentType
 */
export function downloadFile(attachment: DocumentAttachment | Attachment) {
  try {
    const data = attachment.file;
    const type = attachment.contentType;
    const filename = attachment.title;

    if (typeof data !== 'string') {
      throw new Error();
    }

    const blob = base64ToBlob(data.split(',')[1], type);

    // @ts-ignore
    if (window.navigator.msSaveOrOpenBlob) {
      // @ts-ignore
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename || '';
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }

    pushTrackingEvent(TRACKING_EVENTS.DOCUMENT_DOWNLOAD_SUCCESS);
  } catch (error) {
    actions.setNotification('error');
    pushTrackingEvent(TRACKING_EVENTS.DOCUMENT_DOWNLOAD_ERROR);
  }
}

/**
 * @param {string} base64File - creates a new type named 'base64File'
 */
export function printDocument(base64File: string) {
  const iframe = document.getElementById('d4l-print-image') as HTMLIFrameElement;
  const iframeDocument = iframe.contentDocument as HTMLDocument;
  const iframeWindow = iframe.contentWindow as Window;
  if (iframe) {
    const imageWrapper = document.createElement('div');
    const imageElement = document.createElement('img');
    imageWrapper.setAttribute(
      'style',
      'display: flex; align-items: center; justify-content: center; page-break-after:avoid; height:99%;'
    );
    imageElement.src = base64File;
    imageElement.setAttribute(
      'style',
      'width: auto; height: auto; max-height: 100%; max-width: 100%;'
    );
    imageWrapper.appendChild(imageElement);
    iframeDocument.body.appendChild(imageWrapper);
    iframeWindow.onafterprint = function () {
      setTimeout(() => {
        iframeDocument.body.innerHTML = '';
      }, 500);
    };
    imageElement.onload = function () {
      iframe.focus();
      if (isBrowser.safari) {
        iframeWindow.document.execCommand('print', false, undefined);
      } else {
        iframeWindow.print();
      }
    };
  }
}
