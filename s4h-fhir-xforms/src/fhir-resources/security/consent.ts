import * as t from "io-ts";

import { FHIR_code_T, FHIR_dateTime_T } from "../base/primitives";
import { FHIR_CodeableConcept_T, FHIR_DomainResource_T, FHIR_Period_T, FHIR_Reference_T } from "../base/general-special-purpose";

// Warning: This resource is incompletely defined. It is just used for the data generator.
export const FHIR_Consent_Provision_T = t.partial({
    type:      FHIR_code_T,
    period:    FHIR_Period_T,
    code:      t.array(FHIR_CodeableConcept_T),
    provision: t.array(t.type({
        type:  FHIR_code_T,
        code:  t.array(FHIR_CodeableConcept_T)
    }))
});

// Warning: This resource is incompletely defined. It is just used for the data generator.
export const Internal_FHIR_Consent_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Consent"),

        status: t.keyof({
            "draft":    null,
            "active":   null,
            "inactive": null,
            "entered-in-error":     null,
            "unknown":  null
        }),
        scope: FHIR_CodeableConcept_T,
        category: t.array(FHIR_CodeableConcept_T)
    }),

    t.partial({
        dateTime:   FHIR_dateTime_T,
        policyRule: FHIR_CodeableConcept_T,
        provision:  FHIR_Consent_Provision_T,
        patient:    FHIR_Reference_T
    })
]);

type Internal_FHIR_Consent_A = t.TypeOf<  typeof Internal_FHIR_Consent_T>;
type Internal_FHIR_Consent   = t.OutputOf<typeof Internal_FHIR_Consent_T>;

export const FHIR_Consent_T = new t.Type<Internal_FHIR_Consent_A, Internal_FHIR_Consent, unknown>(
    "FHIR_Consent_T",
    Internal_FHIR_Consent_T.is,
    Internal_FHIR_Consent_T.decode,

    (obj: Internal_FHIR_Consent_A) => {
        const enc = Internal_FHIR_Consent_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_occurredTag"];
        return enc;
    }
);

export type FHIR_Consent_A = t.TypeOf<  typeof FHIR_Consent_T>;
export type FHIR_Consent   = t.OutputOf<typeof FHIR_Consent_T>;
