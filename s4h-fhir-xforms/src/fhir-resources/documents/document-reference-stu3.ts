import * as t from "io-ts";

import { FHIR_code_T, FHIR_dateTime_T, FHIR_id_T, FHIR_instant_T, FHIR_string_T } from "../base/primitives";
import { FHIR_Attachment_T, FHIR_CodeableConcept_A, FHIR_CodeableConcept_T, FHIR_Coding_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Reference_T, FHIR_Resource_T } from "../base/general-special-purpose";

import { FHIR_DocumentReference_A } from "./document-reference-r4";


export const FHIR_DocumentReference_Content_T = t.intersection([
    t.type({
        attachment: FHIR_Attachment_T
    }),
    t.partial({
        format:     FHIR_Coding_T
    })
]);

export const FHIR_DocumentReference_Context_T = t.partial({
    encounter:         t.array(FHIR_Reference_T),
    event:             t.array(FHIR_CodeableConcept_T),
    period:            FHIR_Period_T,
    facilityType:      FHIR_CodeableConcept_T,
    practiceSetting:   FHIR_CodeableConcept_T,
    sourcePatientInfo: FHIR_Reference_T,
    related:           t.array(FHIR_Reference_T)
});

export const FHIR_UnconstrainedCodeableConcept_T = t.partial({
    coding: t.array(FHIR_Coding_T),
    text:   FHIR_string_T
});

export const FHIR_STU3_DocumentReference_T = t.intersection([
    t.type({
        resourceType: t.literal("DocumentReference"),
        id:           FHIR_id_T,    // mandatory here, opposed to FHIR standard
        status: t.keyof({
            "current":          null,
            "superseded":       null,
            "entered-in-error": null
        }),
        content: t.array(FHIR_DocumentReference_Content_T),
        indexed: FHIR_instant_T,

        // We also need to support old malformed STU3 resources where the type is empty.
        // This is handled in the conversion function below.
        type: FHIR_UnconstrainedCodeableConcept_T
    }),
    t.partial({
        // Resource
        language:   FHIR_code_T,

        // DomainResource
        contained:  t.array(FHIR_Resource_T),

        // DocumentReference
        masterIdentifier: FHIR_Identifier_T,
        identifier: t.array(FHIR_Identifier_T),
        docStatus:  t.keyof({
            "preliminary":      null,
            "final":            null,
            "amended":          null,
            "entered-in-error": null
        }),
        class:         FHIR_CodeableConcept_T,
        created:       FHIR_dateTime_T,
        subject:       FHIR_Reference_T,
        author:        t.array(FHIR_Reference_T),
        authenticator: FHIR_Reference_T,
        custodian:     FHIR_Reference_T,
        relatesTo:     t.array(t.type({
            code:      FHIR_code_T,
            target:    FHIR_Reference_T
        })),
        description:   FHIR_string_T,
        securityLabel: t.array(FHIR_CodeableConcept_T),
        context:       FHIR_DocumentReference_Context_T
    })
]);

export type FHIR_STU3_DocumentReference_A = t.TypeOf<  typeof FHIR_STU3_DocumentReference_T>;
export type FHIR_STU3_DocumentReference   = t.OutputOf<typeof FHIR_STU3_DocumentReference_T>;

// eslint-disable-next-line complexity
export function convertDocumentReferenceSTU3toR4 (stu3DocRef: FHIR_STU3_DocumentReference_A): FHIR_DocumentReference_A {
    const r4DocRef: FHIR_DocumentReference_A = {
        // mandatory fields
        resourceType:    "DocumentReference",
        id:               stu3DocRef.id,
        status:           stu3DocRef.status,
        content:          stu3DocRef.content,

        // optional fields
        ...(stu3DocRef.language         ? { language:         stu3DocRef.language         } : {} ),
        ...(stu3DocRef.contained        ? { contained:        stu3DocRef.contained        } : {} ),
        ...(stu3DocRef.masterIdentifier ? { masterIdentifier: stu3DocRef.masterIdentifier } : {} ),
        ...(stu3DocRef.identifier       ? { identifier:       stu3DocRef.identifier       } : {} ),
        ...(stu3DocRef.docStatus        ? { docStatus:        stu3DocRef.docStatus        } : {} ),
        ...(stu3DocRef.subject          ? { subject:          stu3DocRef.subject          } : {} ),
        ...(stu3DocRef.author           ? { author:           stu3DocRef.author           } : {} ),
        ...(stu3DocRef.authenticator    ? { authenticator:    stu3DocRef.authenticator    } : {} ),
        ...(stu3DocRef.custodian        ? { custodian:        stu3DocRef.custodian        } : {} ),
        ...(stu3DocRef.relatesTo        ? { relatesTo:        stu3DocRef.relatesTo        } : {} ),
        ...(stu3DocRef.description      ? { description:      stu3DocRef.description      } : {} ),
        ...(stu3DocRef.securityLabel    ? { securityLabel:    stu3DocRef.securityLabel    } : {} ),
        ...(stu3DocRef.context          ? { context:          stu3DocRef.context          } : {} ),

        // indexed -> date
        ...(stu3DocRef.indexed          ? { date:             stu3DocRef.indexed          } : {} )
    };

    if (typeof stu3DocRef.type !== "undefined") {
        const typeProp: FHIR_CodeableConcept_A = {};
        if (stu3DocRef.type.coding?.length > 0) {
            typeProp.coding = stu3DocRef.type.coding;
        }
        if (typeof stu3DocRef.type.text === "string") {
            typeProp.text = stu3DocRef.type.text;
        }
        if (Object.keys(typeProp).length > 0) {
            r4DocRef.type = typeProp;
        }
    }

    if (stu3DocRef.class?.coding instanceof Array) {
        if (stu3DocRef.class.coding.length > 0) {
            r4DocRef.category = [
                stu3DocRef.class
            ];
        }
    }

    return r4DocRef;
}
