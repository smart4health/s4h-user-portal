import * as t from "io-ts";

import { FHIR_boolean_T, FHIR_dateTime_T } from "../base/primitives";
import { FHIR_Address_T, FHIR_Attachment_T, FHIR_CodeableConcept_T, FHIR_ContactPoint_T, FHIR_DomainResource_T, FHIR_HumanName_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Reference_T } from "../base/general-special-purpose";


export const FHIR_Practitioner_qualification_T = t.intersection([
    t.type({
        code:       FHIR_CodeableConcept_T
    }),
    t.partial({
        identifier: t.array(FHIR_Identifier_T),
        period:     FHIR_Period_T,
        issuer:     FHIR_Reference_T
    })
]);


export const Internal_FHIR_Practitioner_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType:  t.literal("Practitioner")
    }),
    t.partial({
        active:        FHIR_boolean_T,
        identifier:    t.array(FHIR_Identifier_T),
        name:          t.array(FHIR_HumanName_T),
        gender: t.keyof({
            "male":    null,
            "female":  null,
            "other":   null,
            "unknown": null
        }),
        birthDate:     FHIR_dateTime_T,
        telecom:       t.array(FHIR_ContactPoint_T),
        address:       t.array(FHIR_Address_T),
        photo:         t.array(FHIR_Attachment_T),
        qualification: t.array(FHIR_Practitioner_qualification_T),
        communication: t.array(FHIR_CodeableConcept_T)
    })
]);

type Internal_FHIR_Practitioner_A = t.TypeOf<  typeof Internal_FHIR_Practitioner_T>;
type Internal_FHIR_Practitioner   = t.OutputOf<typeof Internal_FHIR_Practitioner_T>;

export const FHIR_Practitioner_T = new t.Type<Internal_FHIR_Practitioner_A, Internal_FHIR_Practitioner, unknown>(
    "FHIR_Practitioner_T",
    Internal_FHIR_Practitioner_T.is,
    Internal_FHIR_Practitioner_T.decode,

    (obj: Internal_FHIR_Practitioner_A) => {
        const enc = Internal_FHIR_Practitioner_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_effectiveTag"];
        delete enc["_valueTag"];
        return enc;
    }
);

export type FHIR_Practitioner_A = t.TypeOf<  typeof FHIR_Practitioner_T>;
export type FHIR_Practitioner   = t.OutputOf<typeof FHIR_Practitioner_T>;
