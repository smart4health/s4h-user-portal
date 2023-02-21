import D4LSDK, { Attachment } from '@d4l/js-sdk';
import {
  apiReadGroupList,
  DocumentOperationsOptions,
  DocumentReferenceBag,
  Group,
  makeDocumentReference,
} from '@d4l/s4h-fhir-xforms';
import { DocumentFormData } from '../features/modals/components/ManageGroup/DocumentForm';
import backpainTreatmentQuestionnaires from '../fhir/questionnaires/backpain-treatment';
import backpainPreventionQuestionnaires from '../fhir/questionnaires/backpain-prevention';
import { NotLoggedInError } from '../utils/error/login';
import logIssueList from '../utils/logIssueList';
import { deleteSDKResource, handleSDKErrors } from './D4L';
import { downloadDocument } from './document';

const createDocumentReferenceDraft = async (
  {
    id,
    title,
    date,
    category,
    doctorFirstName,
    doctorLastName,
    specialty,
    file,
  }: DocumentFormData,
  provenanceOptions: DocumentOperationsOptions
) => {
  if (!(title && date && file)) {
    throw new Error(
      'Required field is missing. Check if title, date and file are supplied.'
    );
  }
  const documentReferenceBag: DocumentReferenceBag = {
    id,
    title: title,
    docDateTime: date,
    file: file,
  };

  if (category) {
    documentReferenceBag.category = [
      {
        coding: category.coding,
      },
    ];
  }

  if (doctorFirstName && doctorLastName && specialty) {
    documentReferenceBag.practitioner = {
      firstName: doctorFirstName,
      lastName: doctorLastName,
      specialty: {
        coding: specialty.coding,
      },
    };
  }

  return makeDocumentReference(documentReferenceBag, provenanceOptions);
};

export const processRecords = async (
  records: D4LSDK.Record[]
): Promise<{ groupList: Group[] | undefined; records: D4LSDK.Record[] }> => {
  try {
    const backpainTreatmentQuestionnairesFhirResources =
      backpainTreatmentQuestionnaires.map(record => record.fhirResource);

    const backpainPreventionQuestionnairesResources =
      backpainPreventionQuestionnaires.map(record => record.fhirResource);

    // @ts-ignore TS-FIXME
    const [issueList, transformationResult] = await apiReadGroupList({
      additionalResources: [
        ...backpainTreatmentQuestionnairesFhirResources,
        ...backpainPreventionQuestionnairesResources,
      ],
      removeAnswers: ['training_no'],
      sdk: D4LSDK,
    });

    logIssueList(issueList);

    return {
      groupList: transformationResult?.model.groupList,
      records: [...records, ...backpainTreatmentQuestionnaires],
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchGroups = async () => {
  try {
    const userId = D4LSDK.getCurrentUserId();
    if (!userId) {
      throw new NotLoggedInError();
    }

    const [
      { records: documentReferenceRecords },
      { records: encounterRecords },
      { records: questionnaireResponseRecords },
    ] = await Promise.all([
      D4LSDK.fetchResources(userId, {
        resourceType: 'DocumentReference',
      }),
      D4LSDK.fetchResources(userId, {
        resourceType: 'Encounter',
      }),
      D4LSDK.fetchResources(userId, {
        resourceType: 'QuestionnaireResponse',
      }),
    ]);

    const { groupList, records: recordsIncludingBackpainTreatmentQuestionnaires } =
      await processRecords([
        ...documentReferenceRecords,
        ...encounterRecords,
        ...questionnaireResponseRecords,
      ]);

    return {
      groupList,
      records: recordsIncludingBackpainTreatmentQuestionnaires,
    };
  } catch (error) {
    handleSDKErrors(error);
  }

  return {
    groupList: undefined,
    records: [],
  };
};

export const upsertDocument = async (
  values: DocumentFormData,
  provenanceOptions: DocumentOperationsOptions
) => {
  const userId = D4LSDK.getCurrentUserId();

  if (!userId) {
    throw new NotLoggedInError();
  }

  const isUpdate = !!values.id;

  const { documentReference, provenance } = await createDocumentReferenceDraft(
    values,
    provenanceOptions
  );
  const uploadedDocumentReference: D4LSDK.Record = isUpdate
    ? await D4LSDK.updateResource(userId, documentReference)
    : await D4LSDK.createResource(userId, documentReference);
  const uploadedProvenance: D4LSDK.Record = await D4LSDK.createResource(
    userId,
    provenance
  );

  return {
    documentRecord: uploadedDocumentReference,
    provenanceRecord: uploadedProvenance,
  };
};

export const deleteDocumentGroup = async (id: string) => {
  return await deleteSDKResource(id);
};

export const getAttachmentsForDocument = async (documentId: string) => {
  // downloadDocument is reused from the old documents app code
  const documentWithBase64Attachments = await downloadDocument(documentId, {
    imageSize: 'full',
  });

  const attachments: Attachment[] = (documentWithBase64Attachments as any)
    .attachments;

  const attachmentsMap: { [attachmentId: string]: Attachment } = {};

  const result = attachments.reduce((memo, attachment) => {
    if (attachment.id) {
      memo[attachment.id] = attachment;
    }

    return memo;
  }, attachmentsMap);

  return result;
};
