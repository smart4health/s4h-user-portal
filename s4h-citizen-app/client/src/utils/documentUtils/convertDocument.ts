// @ts-ignore
import D4LSDK from '@d4l/js-sdk';
import { Document } from '../../types';
import D4LSpecialty from './D4LSpecialty';

type Options = {
  partnerIdToSet?: string;
  isDocumentNew?: boolean;
  isDocumentEdit?: boolean;
};

export function convertSDKDocumentToDocument(
  sdkRecord: {
    fhirResource: Object;
    partner: any;
  },
  options: Options = {}
): Document {
  const {
    partnerIdToSet = '',
    isDocumentNew = false,
    isDocumentEdit = false,
  } = options;
  // @ts-ignore
  const documentReference = D4LSDK.models.DocumentReference.fromFHIRObject(
    sdkRecord.fhirResource
  );
  let documentType = documentReference.getType();

  if (typeof documentType === 'object') {
    // @ts-ignore
    documentType = D4LSDK.getDisplayFromCodeableConcept(documentType);
  }

  // ignoring and not typing super specifically as typescript doesn't yet understand spreads
  // @ts-ignore
  const document: Document = {
    ...sdkRecord,
    partner: !sdkRecord.partner ? partnerIdToSet : sdkRecord.partner,
    flagNew: isDocumentNew,
    flagEdit: isDocumentEdit,
    attachments: documentReference.getAttachments(),
    title: documentReference.getTitle(),
    type: documentType ? documentType : '',
  };

  const specialty = documentReference.getPracticeSpecialty();
  // @ts-ignore
  const specialtyCode = D4LSDK.getCodeFromCodeableConcept(specialty);

  try {
    // @ts-ignore
    document.author = {};

    if (documentReference.getAuthor() && specialty) {
      const practitioner = documentReference.getPractitioner();
      document.author = {
        firstName: practitioner.getFirstName(),
        lastName: practitioner.getLastName(),
        prefix: practitioner.getPrefix(),
        suffix: practitioner.getSuffix(),
        street: practitioner.getStreet(),
        city: practitioner.getCity(),
        postalCode: practitioner.getPostalCode(),
        telephone: practitioner.getTelephone(),
        website: practitioner.getWebsite(),
        // @ts-ignore TS-FIXME
        specialty: Object.keys(D4LSpecialty).find(
          key => D4LSpecialty[key] === specialtyCode
        ),
      };
    }
  } catch (e) {
    console.error(
      'Handled an error which happened when accessing the author of a DocumentReference'
    );
  }

  return document;
}
