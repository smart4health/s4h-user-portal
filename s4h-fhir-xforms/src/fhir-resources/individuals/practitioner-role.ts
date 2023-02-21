import * as t from "io-ts";

import { FHIR_boolean_T, FHIR_string_T, FHIR_time_T } from "../base/primitives";
import { FHIR_CodeableConcept_T, FHIR_ContactPoint_T, FHIR_DomainResource_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Reference_T } from "../base/general-special-purpose";


export const FHIR_PractitionerRole_availableTime_T = t.partial({
    daysOfWeek:         t.array(t.keyof({ mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null })),
    allDay:             FHIR_boolean_T,
    availableStartTime: FHIR_time_T,
    availableEndTime:   FHIR_time_T
});

export const FHIR_PractitionerRole_notAvailable_T = t.intersection([
    t.type({
        description: FHIR_string_T
    }),

    t.partial({
        during:      FHIR_Period_T
    })
]);

export const Internal_FHIR_PractitionerRole_T = t.intersection([
    FHIR_DomainResource_T,

    t.type({
        resourceType:           t.literal("PractitionerRole")
    }),

    t.partial({
        identifier:             t.array(FHIR_Identifier_T),
        active:                 FHIR_boolean_T,
        period:                 FHIR_Period_T,
        practitioner:           FHIR_Reference_T,
        organization:           FHIR_Reference_T,
        code:                   t.array(FHIR_CodeableConcept_T),
        specialty:              t.array(FHIR_CodeableConcept_T),
        location:               t.array(FHIR_Reference_T),
        healthcareService:      t.array(FHIR_Reference_T),
        telecom:                t.array(FHIR_ContactPoint_T),
        availableTime:          t.array(FHIR_PractitionerRole_availableTime_T),
        notAvailable:           t.array(FHIR_PractitionerRole_notAvailable_T),
        availabilityExceptions: FHIR_string_T,
        endpoint:               t.array(FHIR_Reference_T)
    })
]);

type Internal_FHIR_PractitionerRole_A = t.TypeOf<  typeof Internal_FHIR_PractitionerRole_T>;
type Internal_FHIR_PractitionerRole   = t.OutputOf<typeof Internal_FHIR_PractitionerRole_T>;

export const FHIR_PractitionerRole_T = new t.Type<Internal_FHIR_PractitionerRole_A, Internal_FHIR_PractitionerRole, unknown>(
    "FHIR_PractitionerRole_T",
    Internal_FHIR_PractitionerRole_T.is,
    Internal_FHIR_PractitionerRole_T.decode,

    (obj: Internal_FHIR_PractitionerRole_A) => {
        const enc = Internal_FHIR_PractitionerRole_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_effectiveTag"];
        delete enc["_valueTag"];
        return enc;
    }
);

export type FHIR_PractitionerRole_A = t.TypeOf<  typeof FHIR_PractitionerRole_T>;
export type FHIR_PractitionerRole   = t.OutputOf<typeof FHIR_PractitionerRole_T>;
