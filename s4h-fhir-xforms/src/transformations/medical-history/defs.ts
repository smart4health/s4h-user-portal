import * as t from "io-ts";

import { FHIR_Patient_gender_T } from "../../fhir-resources/individuals/patient";
import { FHIR_Coding_T, FHIR_Identifier_T, FHIR_code_T, FHIR_date_T, FHIR_positiveInt_T } from "../../fhir-resources/types";


export const UnitValue_T = t.type({
    value: FHIR_positiveInt_T,
    unit:  FHIR_code_T
});

export type UnitValue_A = t.TypeOf<  typeof UnitValue_T>;
export type UnitValue   = t.OutputOf<typeof UnitValue_T>;

export const PersonalData_T = t.partial({
    firstName:   t.string,
    lastName:    t.string,

    gender:      FHIR_Patient_gender_T,
    dateOfBirth: FHIR_date_T,

    height: UnitValue_T,
    weight: UnitValue_T,

    bloodGroup:  FHIR_Coding_T,
    bloodRhesus: FHIR_Coding_T,

    occupation:  t.string
});

export type PersonalData_A = t.TypeOf<  typeof PersonalData_T>;
export type PersonalData   = t.OutputOf<typeof PersonalData_T>;


export const MedicalHistory_T = t.intersection([
    t.type({
        modelType:    t.literal("MedicalHistory/1")
    }),
    t.partial({
        personalData: PersonalData_T,
        inputResourceIds: t.array(t.string),
        inputResourceIdentifiers: t.array(t.array(FHIR_Identifier_T))
    })
]);

export type MedicalHistory_A = t.TypeOf<  typeof MedicalHistory_T>;
export type MedicalHistory   = t.OutputOf<typeof MedicalHistory_T>;

export const CODINGS_BODY_WEIGHT = [
    // removed
];

export const CODINGS_BODY_HEIGHT = [{
    // removed
}];

export const CODINGS_OCCUPATION = [{
    // removed
}];

export const CODINGS_BLOOD_GROUP = [
    // removed
];

export const CODINGS_BLOOD_RH = [
    // removed
];
