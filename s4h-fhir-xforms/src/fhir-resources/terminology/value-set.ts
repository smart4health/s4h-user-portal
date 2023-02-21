import * as t from "io-ts";

import { FHIR_Coding_T, FHIR_DomainResource_T } from "../base/general-special-purpose";
import { FHIR_boolean_T, FHIR_code_T, FHIR_string_T, FHIR_uri_T } from "../base/primitives";


export const FHIR_ValueSet_Expansion_T = t.type({
    contains: t.array(FHIR_Coding_T)
});


export const FHIR_ValueSet_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("ValueSet"),
        status: t.keyof({
            draft:   null,
            active:  null,
            retired: null,
            unknown: null
        })
    }),
    t.partial({
        url:       FHIR_uri_T,
        language:  FHIR_code_T,
        version:   FHIR_string_T,
        name:      FHIR_string_T,
        title:     FHIR_string_T,
        immutable: FHIR_boolean_T,
        expansion: FHIR_ValueSet_Expansion_T
    })
]);

export type FHIR_ValueSet_A = t.TypeOf<  typeof FHIR_ValueSet_T>;
export type FHIR_ValueSet   = t.OutputOf<typeof FHIR_ValueSet_T>;
