import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { flow, pipe } from "fp-ts/function";

import { uuidv4 } from "../../../utils/uuid";
import { TauInstant } from "../../../fhir-resources/utils/tau";
import { pickSingleOrUndefined } from "../../../utils/fp-tools";
import { IssueList_A, IssueList_T, ctx, err, msg } from "../../../utils/issues";
import { ArrayBufferToBase64Encoder, arrayBufferToBase64 } from "../../../utils/base64";
import { FHIR_PractitionerRole_A } from "../../../fhir-resources/individuals/practitioner-role";
import { FHIR_Practitioner_A, FHIR_Practitioner_T } from "../../../fhir-resources/individuals/practitioner";
import { FHIR_Provenance, FHIR_Provenance_A, FHIR_Provenance_T } from "../../../fhir-resources/security/provenance";
import { FHIR_CodeableConcept, FHIR_CodeableConcept_A, FHIR_Identifier_A, FHIR_Resource_A, FHIR_instant_T } from "../../../fhir-resources/types";
import { FHIR_DocumentReference, FHIR_DocumentReference_A, FHIR_DocumentReference_T, deepCopy as deepDocumentReferenceCopy } from "../../../fhir-resources/documents/document-reference-r4";


export type PractitionerBag = {
    firstName: string;
    lastName:  string;
    specialty: FHIR_CodeableConcept;
};

export type DocumentReferenceBag = {
    id?:           string;                   // DocumentReference.id, if set, random UUID otherwise
    docDateTime:   Date;                     // DocumentReference.date
    file:          File;                     // becomes single Attachment
    title:         string;                   // Attachment.title
    category?:     FHIR_CodeableConcept_A[]; // DocumentReference.category
    practitioner?: PractitionerBag;          // becomes contained Practitioner and PractitionerRole
};

export type DocumentOperationsOptions = {
    arrayBufferToBase64?: ArrayBufferToBase64Encoder;
    userId:         string;
    clientId?:      string;
    recorded:       Date;                     // Provenance.recorded
};

export type DocumentReferenceProvenanceTuple = {
    documentReference: FHIR_DocumentReference;
    provenance: FHIR_Provenance;
};


export async function makeDocumentReference (post: DocumentReferenceBag, options: DocumentOperationsOptions): Promise<DocumentReferenceProvenanceTuple> {

    options.arrayBufferToBase64 = options.arrayBufferToBase64 ?? arrayBufferToBase64;

    const tauRecorded = FHIR_instant_T.decode(options.recorded.toISOString());
    if (E.isLeft(tauRecorded)) {
        throw IssueList_T.encode([ err({ ...msg("recorded time is invalid") }) ]);
    }

    const docRef: FHIR_DocumentReference_A = {
        resourceType: "DocumentReference",
        id:            post.id ?? uuidv4(),
        identifier:    [{
            system: "urn:ietf:rfc:3986",
            value:  "urn:uuid:" + uuidv4()
        }],
        status:       "current",
        description:   post.title,
        content:       [{
            attachment: {
                id:          post.file.name,
                title:       post.title,
                contentType: post.file.type,
                size:        post.file.size,
                file:        post.file
            }
        }]
    };

    const result = pipe(docRef,
        patchDate(post.docDateTime),
        E.chain(patchCategory(post.category)),
        E.chain(patchPractitioner(post.practitioner)),
        E.map(FHIR_DocumentReference_T.encode)
    );

    if (E.isLeft(result)) {
        throw IssueList_T.encode(result.left);
    } else {
        return {
            documentReference: result.right,
            provenance: FHIR_Provenance_T.encode(makeProvenanceResource(docRef.identifier[0], "CREATE", tauRecorded.right, options.userId, O.fromNullable(options.clientId)))
        };
    }
}

export async function amendDocumentReference (resource: unknown, patch: Omit<Partial<DocumentReferenceBag>, "id">, options: DocumentOperationsOptions): Promise<DocumentReferenceProvenanceTuple> {
    const docRef = FHIR_DocumentReference_T.decode(resource);
    if (E.isLeft(docRef)) {
        throw [ err({ ...msg("resource is not a DocumentReference; see context"), ...ctx({ resource }) }) ];
    }

    const tauRecorded = FHIR_instant_T.decode(options.recorded.toISOString());
    if (E.isLeft(tauRecorded)) {
        throw IssueList_T.encode([ err({ ...msg("recorded time is invalid") }) ]);
    }

    const result = pipe(docRef.right,
        disallowPatch("file", patch.file),
        E.chain(disallowPatch("title", patch.title)),

        E.chain(patchDate(patch.docDateTime)),
        E.chain(patchCategory(patch.category)),
        E.chain(patchPractitioner(patch.practitioner)),
        E.chain(ensureIdentifier())
    );

    if (E.isLeft(result)) {
        throw IssueList_T.encode(result.left);
    } else {
        return {
            documentReference: FHIR_DocumentReference_T.encode(result.right),
            provenance: FHIR_Provenance_T.encode(makeProvenanceResource(result.right.identifier[0], "UPDATE", tauRecorded.right, options.userId, O.fromNullable(options.clientId)))
        };
    }
}

const disallowPatch = <T>(prop: string, newValue?: T):
    (docRef: FHIR_DocumentReference_A) => E.Either<IssueList_A, FHIR_DocumentReference_A> => docRef => {

    if (typeof newValue !== "undefined") {
        return E.left([ err({ ...msg(`cannot replace ${prop}`) }) ]);
    }
    return E.right(docRef);
};

const patchDate = (newDate?: Date): (docRef: FHIR_DocumentReference_A) => E.Either<IssueList_A, FHIR_DocumentReference_A> => docRef => {
    if (typeof newDate === "undefined") {
        return E.right(docRef);
    }

    return pipe(newDate.toISOString(),
        FHIR_instant_T.decode,
        E.mapLeft(errors => [ err({ ...msg("incorrect date; see context"), ...ctx({ date: newDate, errors }) }) ]),
        E.map(date => ({ ...docRef, date }))
    );
};

// Amending category means replacement, no merging of the codings takes place.
const patchCategory = (newCategory?: FHIR_CodeableConcept_A[]):
    (docRef: FHIR_DocumentReference_A) => E.Either<IssueList_A, FHIR_DocumentReference_A> => docRef => {

    if (typeof newCategory === "undefined") {
        return E.right(docRef);
    }

    if (newCategory.length === 0) {
        return E.right({ ...docRef, category: undefined });
    }

    return E.right({ ...docRef, category: newCategory });
};

// Amending practitioner means replacement, no merging of properties takes place.
const patchPractitioner = (newPractitioner?: PractitionerBag):
    (docRef: FHIR_DocumentReference_A) => E.Either<IssueList_A, FHIR_DocumentReference_A> => docRef => {

    if (typeof newPractitioner === "undefined") {
        return E.right(docRef);
    }

    if (docRef.author instanceof Array) {
        if (docRef.author.length > 1) {
            return E.left([ err({ ...msg(`patching practitioner is only possible if DocumentResource has at most 1 author; this one has ${docRef.author.length}`) }) ]);
        }

        if (docRef.author.length === 1) {
            const copy = deepDocumentReferenceCopy(docRef);
            if (O.isNone(copy)) {
                return E.left([ err({ ...msg("could not create deep copy of DocumentReference resource") }) ]);
            }

            const practitioner = getPractitioner(copy.value, 0);
            if (O.isNone(practitioner)) {
                return E.left([ err({ ...msg("author references of DocumentReference could not be resolved to a Practitioner") }) ]);
            }

            const role = getPractitionerRole(copy.value, practitioner.value);
            if (O.isNone(role)) {
                return E.left([ err({ ...msg("Practitioner's role could not be resolved to a PractitionerRole") }) ]);
            }

            practitioner.value.name =  [{
                family:  newPractitioner.lastName,
                given: [ newPractitioner.firstName ]
            }];

            role.value.specialty = [ newPractitioner.specialty ];

            return E.right(copy.value);

        }

        // Arriving here means the author array is present but empty, which is technically a data error.
        // We fall through here as if the author property was undefined to allow for the practitioner to be added.
    }

    // No author yet, just create new Practitioner and PractitionerRole resource and add to docRef
    const practitioner = makePractitioner(newPractitioner);
    const role = makePractitionerRole(practitioner, newPractitioner.specialty);

    return E.right({ ...docRef,
        author:    [{ reference: "#" + practitioner.id }],
        contained: [ practitioner, role ]
     });
};

const idEq = (id: string): (res: FHIR_Resource_A) => boolean => res => res.id === id;

function getPractitioner (docRef: FHIR_DocumentReference_A, authorIndex: number): O.Option<FHIR_Practitioner_A> {
    return pipe(docRef.author,            // array which could be undefined
        O.fromNullable,                   // lift to Option space
        O.mapNullable(arr => arr[authorIndex]), // get the index-th entry (could be undefined if out of bounds)
        O.mapNullable(author => author.reference), // access reference property, which can be undefined

        // select the Practitioner resource corresponding to the `reference` from the `contained` array
        O.map(ref => pipe(docRef.contained, // go through `contained` array
            O.fromNullable,                 // lift to Option space
            O.map(                          // filter might return an empty array
                flow(                       // filter for Practitioner resource with matching `id`
                    A.filter(FHIR_Practitioner_T.is),
                    A.filter(idEq(ref.substr(1))) // chop off the leading '#'
                )
            ),
            // pick only result, if any; else map to O.none
            O.mapNullable(pickSingleOrUndefined)
        )),
        O.flatten, // fix the double Option
        O.map(prac => prac as FHIR_Practitioner_A) // keep the type system calm (`contained` array is IResource[])
    );
}

function getPractitionerRole (docRef: FHIR_DocumentReference_A, practitioner: FHIR_Practitioner_A): O.Option<FHIR_PractitionerRole_A> {
    return pipe(docRef.contained, // go through `contained` array
        O.fromNullable,           // lift to Option space
        O.map(                    // filter might return an empty array
            flow(                 // filter for PractitionerRole resource with matching `id`
                A.filter(res => res.resourceType === "PractitionerRole"),
                A.filter(res => (res as FHIR_PractitionerRole_A).practitioner?.reference === "#" + practitioner.id)
            )
        ),
        // pick only result, if any; else map to O.none
        O.mapNullable(pickSingleOrUndefined),
        O.map(role => role as FHIR_PractitionerRole_A) // keep the type system calm (`contained` array is IResource[])
    );
}

function makePractitioner (bag: PractitionerBag): FHIR_Practitioner_A {
    return {
        resourceType: "Practitioner",
        id: uuidv4(),
        name: [{
            family:  bag.lastName,
            given: [ bag.firstName ]
        }]
    };
}

function makePractitionerRole (practitioner: FHIR_Practitioner_A, specialty: FHIR_CodeableConcept_A): FHIR_PractitionerRole_A {
    return {
        resourceType: "PractitionerRole",
        id: uuidv4(),
        practitioner: { reference: "#" + practitioner.id },
        specialty: [ specialty ]
    };
}

// function ensureIdentifier (docRef: FHIR_DocumentReference_A): E.Either<IssueList_A, FHIR_DocumentReference_A> {
const ensureIdentifier = (): (docRef: FHIR_DocumentReference_A) => E.Either<IssueList_A, FHIR_DocumentReference_A> => docRef => {
    if (typeof docRef.identifier === "undefined") {
        return E.right({ ...docRef, identifier: [{
            system: "urn:ietf:rfc:3986",
            value:  "urn:uuid:" + uuidv4()
        }] });

    } else {
        return E.right(docRef);
    }
};


// eslint-disable-next-line max-params
function makeProvenanceResource (identifier: FHIR_Identifier_A, activity: string, tauRecorded: TauInstant, userId: string, clientId: O.Option<string>): FHIR_Provenance_A {
    const prov: FHIR_Provenance_A = {
        resourceType: "Provenance",
        id: uuidv4(),
        meta: {
            profile: [
                "http://fhir.smart4health.eu/StructureDefinition/s4h-provenance"
            ]
        },
        target: [{ identifier }],
        recorded: tauRecorded,
        activity: {
            coding:  [{
                system: "http://terminology.hl7.org/CodeSystem/v3-DataOperation",
                code: activity
            }]
        },
        agent: [{
            type: {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "author",
                        display: "Author"
                    }
                ]
            },
            who: {
                identifier: {
                    system: "http://fhir.data4life.care/CodeSystem/user-id",
                    value: userId
                }
            }
        }],
        _occurredTag: "none"
    };

    if (O.isSome(clientId)) {
        prov.agent.push({
            type: {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "composer",
                        display: "Composer"
                    }
                ]
            },
            who: {
                identifier: {
                    system: "http://fhir.smart4health.eu/CodeSystem/s4h-source-system",
                    value: clientId.value
                }
            }
        });
    }

    return prov;
}
