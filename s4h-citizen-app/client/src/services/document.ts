import D4LSDK, { ImageSize, Record } from '@d4l/js-sdk';
// @ts-ignore
import co from 'co';
// @ts-ignore
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { Document } from '../types';
import { pushTrackingEvent, TRACKING_EVENTS } from '../utils/analytics';
import { calculateFileSizesFromBase64 } from '../utils/calculateFileSizesFromBase64';
import determineFilenameForAttachment from '../utils/determineFilenameForAttachment';
import {
  convertSDKDocumentToDocument,
  createDuplicateName,
} from '../utils/documentUtils';
import { NotLoggedInError } from '../utils/error/login';
import isString from '../utils/isString';
import { countSDKResouce, handleSDKErrors } from './D4L';

// delete unneeded props added through download/zip preparation
const removeDownloadMetaData = (objectWithMetaData: Object) => {
  const cleanUpObject = { ...objectWithMetaData };
  // @ts-ignore
  delete cleanUpObject.percentDone;
  // @ts-ignore
  delete cleanUpObject.flagNew;
  // @ts-ignore
  delete cleanUpObject.flagEdit;
  return cleanUpObject;
};

/**
 * This function goes through all the attachments, creates a new FileReader
 * and converts it to the base64 format with readAsDataURL
 * when the last file is done in onload, it resolves its promise
 *
 * @param {Document} document
 */
const convertDocumentFilesToBase64 = (document: Document): Promise<Document> => {
  let counter = 0;
  const attachmentsCount = document.attachments.length;

  function getBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (isString(reader.result)) {
          resolve(String(reader.result));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  return new Promise(resolve => {
    if (document.attachments && document.attachments.length > 0) {
      document.attachments.forEach(async attachment => {
        // @ts-ignore
        if (attachment.file && attachment.file instanceof Blob) {
          attachment.file = await getBase64(attachment.file);
        }
        ++counter;

        if (counter === attachmentsCount) {
          resolve(document);
        }
      });
    } else {
      resolve(document);
    }
  });
};

export const cleanupClientId = (clientId: string) => clientId.split(/#(.+)/)[0];

export const getCountOfDocumentsByApp = async (
  clientId: string
): Promise<number> => {
  try {
    if (!D4LSDK.getCurrentUserId()) {
      throw new NotLoggedInError();
    }
    const tag = `partner=${cleanupClientId(clientId)}`;
    return await countSDKResouce({
      tags: [tag],
    });
  } catch (err: any) {
    return err;
  }
};

export const getDocumentsCount = async (): Promise<string> => {
  try {
    if (!D4LSDK.getCurrentUserId()) {
      throw new NotLoggedInError();
    }
    return await countSDKResouce({
      resourceType: 'DocumentReference',
    });
  } catch (err: any) {
    return err;
  }
};

export const downloadDocument = async (
  id: string,
  { imageSize }: { imageSize: ImageSize }
) => {
  try {
    const currentUserId = D4LSDK.getCurrentUserId();
    if (!currentUserId) {
      throw new NotLoggedInError();
    }
    const response = await D4LSDK.downloadResource(currentUserId, id, {
      imageSize,
    });

    // @ts-ignore
    const documentWithAttachmentBlob = convertSDKDocumentToDocument(response);
    return await convertDocumentFilesToBase64(documentWithAttachmentBlob);
  } catch (error: unknown) {
    handleSDKErrors(error);
    return error;
  }
};

/**
 * A generator function that will return a percentage of completion
 * while Zipping documents after each document attachments are
 * zipped.
 *
 * This is due to a requirement to show a progress indicator while
 * downloading / zipping documents.
 *
 * @param {Array} records
 * @param {String} fileName An optional file name parameter. This will be the name
 *                          of the zipped and downloaded file.
 */
export function* zipDocuments(
  records: any[], // todo: proper type
  fileName: string = 'my-data.zip'
  // @ts-ignore
): Generator<any, any, any> {
  let allAttachments = 0;
  let processedAttachments = 0;
  let percentage = 0;

  // Get the number of all attachments. We need this to calculate
  // percentage
  records.forEach(record => {
    allAttachments += (record.attachments || []).length;
  });

  try {
    const zip = new JSZip();
    const folderNames = [];

    for (let i = 0; i < records.length; i += 1) {
      const record = records[i];
      const isDocumentReference =
        record.fhirResource?.resourceType === 'DocumentReference';

      const folderName: string = isDocumentReference
        ? createDuplicateName(
            folderNames.filter(name => name === record.title).length,
            record.title
          )
        : record.resourceType;
      const recordName: string = isDocumentReference
        ? folderName
        : `${folderName}-${record.id}.json`;

      const zipFolder = zip.folder(folderName);
      folderNames.push(recordName);

      if (isDocumentReference) {
        const attachmentNames: string[] = [];
        // @ts-ignore
        record.attachments.forEach(attachment => {
          if (!attachment.file) {
            return;
          }

          const filename = determineFilenameForAttachment(attachment);

          const attachmentName = createDuplicateName(
            attachmentNames.filter(name => name === filename).length,
            filename
          );
          attachmentNames.push(filename);

          // @ts-ignore
          zipFolder.file(attachmentName, attachment.file.split(',')[1], {
            base64: true,
          });
        });

        // Metadata: we create a new object from the document so we can use it for metadata creation
        const metadataObject = { ...record };
        // @ts-ignore
        metadataObject.attachments.forEach(attachment => {
          if (attachment.file) {
            // base64 string is not needed in the object
            // eslint-disable-next-line no-param-reassign
            delete attachment.file;
          }
        });
        // @ts-ignore
        zipFolder.file(
          'metadata.json',
          JSON.stringify(removeDownloadMetaData(metadataObject), null, 4)
        );
      } else {
        // @ts-ignore
        zipFolder.file(
          recordName,
          new Blob([JSON.stringify(removeDownloadMetaData(record))], {
            type: 'text/plain',
          })
        );
      }

      processedAttachments += (record.attachments || []).length;
      percentage = Math.floor((processedAttachments / allAttachments) * 100);

      // Return percentage that we can use outside the generator
      yield percentage;
    }

    zip
      .generateAsync({ type: 'blob' })
      .then((blob: Blob) => {
        FileSaver.saveAs(blob, fileName);
      })
      .catch((error: ErrorEvent) => {
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
}

function* downloadAttachmentGenerator(record: {
  id: string;
  fhirResource: { resourceType: string };
}): any {
  let returnResource;
  if (record.fhirResource.resourceType === 'DocumentReference') {
    returnResource = yield downloadDocument(record.id, { imageSize: 'full' });
  } else {
    returnResource = record.fhirResource;
  }
  return returnResource;
}

/**
 * Generator function
 *
 * Provided with a list of documents download all attachments
 * for that documents and return a percentage of the downloaded
 * state.
 *
 * @param {Array} documents
 */

export function* downloadAllAttachments(documents: any[]): Generator<any, any, any> {
  try {
    let downloadedDocumentsCount = 0;
    const allDocuments = documents.length;

    const calculatePercentage = (fullDoc: Object) => {
      const percentDone = Math.floor(
        (++downloadedDocumentsCount / allDocuments) * 100
      );
      return { ...fullDoc, ...{ percentDone } };
    };

    for (let i = 0; i < documents.length; i += 1) {
      const document = documents[i];

      /**
       * 'co' is a method that given a generator returns a promise.
       * We need to use a generator here in order to break execution
       * and continue with progress tracking once next promise is resolved.
       */
      yield co(downloadAttachmentGenerator(document))
        .then(calculatePercentage)
        .then((data: any) => {
          if (data.percentDone === 100) {
            pushTrackingEvent(
              data.attachments
                ? TRACKING_EVENTS.DOCUMENT_DOWNLOAD_SUCCESS
                : TRACKING_EVENTS.DOCUMENT_DOWNLOAD_ERROR
            );
          }

          return data;
        });
    }
  } catch (err) {
    console.error(err);
    pushTrackingEvent(TRACKING_EVENTS.DOCUMENT_DOWNLOAD_ERROR);
  }
}

export function getDocumentFilesSize(document: Document): string {
  const filesAsBase64 = document.attachments.map(({ file }) => file as string);
  return calculateFileSizesFromBase64(filesAsBase64);
}

export const WORKAROUND_GET_AUTHOR = (record: Record): string => {
  // @ts-ignore TS-FIXME
  const documentReference = D4LSDK.models.DocumentReference.fromFHIRObject(
    record.fhirResource
  );

  if (documentReference.getAuthor()) {
    const practitioner = documentReference.getPractitioner();
    const firstName = practitioner.getFirstName();
    const lastName = practitioner.getLastName();
    const prefix = practitioner.getPrefix();
    const suffix = practitioner.getSuffix();
    return `${prefix ?? ''} ${firstName} ${lastName} ${suffix ?? ''}`.trim();
  }
  return '';
};

export const WORKAROUND_GET_MEDICAL_METADATA = (record: Record) => {
  // @ts-ignore TS-FIXME
  const documentReference = D4LSDK.models.DocumentReference.fromFHIRObject(
    record.fhirResource
  );
  const medicalMetadata: {
    practitionerFirstName?: string;
    practitionerLastName?: string;
  } = {
    practitionerFirstName: undefined,
    practitionerLastName: undefined,
  };

  const author = documentReference.getAuthor();
  const practitioner = documentReference.getPractitioner();

  if (author && practitioner) {
    medicalMetadata.practitionerFirstName = practitioner.getFirstName();
    medicalMetadata.practitionerLastName = practitioner.getLastName();
  }

  return medicalMetadata;
};
