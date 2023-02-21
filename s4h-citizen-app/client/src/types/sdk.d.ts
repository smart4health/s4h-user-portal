declare module '@d4l/js-sdk' {
  interface Record {
    id?: string;
    fhirResource: fhir.DomainResource;
    annotations?: string[];
    customCreationDate?: Date;
    updatedDate?: Date;
    partner?: string;
  }

  interface CodeableConcept {
    code?: string;
    display: string;
    system?: string;
  }

  function getCurrentUserId(): string | null;

  type FetchResourcesParams = any;
  type FetchResourcesResponse = {
    records: Record[];
    totalCount: number;
  };
  function fetchResources(
    ownerId: string,
    params?: FetchResourcesParams
  ): Promise<FetchResourcesResponse>;

  type ImageSize = 'full' | 'preview' | 'thumbnail';

  interface Attachment {
    file: string;
    id: string;
    title?: string;
    contentType?: string;
    creation?: string;
    hash?: string;
    size?: number;
  }

  function fetchResource(ownerId: string, resourceId: string): Record;
  function downloadResource(
    ownerId: string,
    resourceId: string,
    options?: { imageSize: ImageSize }
  ): Record;

  interface DocumentReferenceConstructor {
    id?: string;
    attachments: AttachmentOptions[];
    type?: fhir.CodeableConcept;
    title?: string;
    creationDate?: Date;
    author?: Practitioner;
    additionalIds?: Record<string, any>;
    practiceSpecialty?: fhir.CodeableConcept;
  }

  type DocumentReferenceOptions = DocumentReferenceConstructor;

  function createCodeableConcept(
    display?: string,
    code?: string,
    system?: string
  ): fhir.CodeableConcept;

  interface PractitionerConstructor {
    id?: string;
    firstName?: string;
    lastName?: string;
    prefix?: string;
    suffix?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    telephone?: string;
    website?: string;
  }

  type PractitionerOptions = PractitionerConstructor;

  interface AttachmentConstructor {
    file?: IBlobFile;
    title?: string;
    contentType?: fhir.code;
    creation?: string;
    id?: string;
  }

  type AttachmentOptions = AttachmentConstructor;

  declare class Attachment {
    constructor(options: AttachmentConstructor);

    file: any;
    id: string;
    size?: number;
    title?: string;
    hash?: string;
    contentType?: fhir.code;
    creation?: fhir.dateTime;
  }

  declare namespace models {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    declare class Practitioner {
      constructor(options: PractitionerContructor);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    declare class DocumentReference {
      constructor(options: DocumentReferenceConstructor);

      public indexed: fhir.instant;
      public date: string;
    }
  }

  function createResource(
    ownerId: string,
    fhirResource: fhir.DomainResource,
    date?: Date,
    annotations?: string[]
  ): Promise<Record>;

  function updateResource(
    ownerId: string,
    fhirResource: fhir.DomainResource,
    date?: Date,
    annotations?: string[]
  ): Promise<Record>;
}
