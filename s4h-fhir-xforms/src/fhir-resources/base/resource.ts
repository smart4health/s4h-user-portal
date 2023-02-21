/* eslint-disable max-len */
import * as t from "io-ts";

import { BoxedPatient, FHIR_Patient, FHIR_Patient_A, FHIR_Patient_T } from "../individuals/patient";
import { BoxedCondition, FHIR_Condition, FHIR_Condition_A, FHIR_Condition_T } from "../summary/condition";
import { FHIR_Practitioner, FHIR_Practitioner_A, FHIR_Practitioner_T } from "../individuals/practitioner";
import { BoxedEncounter, FHIR_Encounter, FHIR_Encounter_A, FHIR_Encounter_T } from "../management/encounter";
import { BoxedObservation, FHIR_Observation, FHIR_Observation_A, FHIR_Observation_T } from "../diagnostics/observation";
import { FHIR_PractitionerRole, FHIR_PractitionerRole_A, FHIR_PractitionerRole_T } from "../individuals/practitioner-role";
import { BoxedQuestionnaire, FHIR_Questionnaire, FHIR_Questionnaire_A, FHIR_Questionnaire_T } from "../definitional-artifacts/questionnaire";
import { BoxedDocumentReference, FHIR_DocumentReference, FHIR_DocumentReference_A, FHIR_DocumentReference_T } from "../documents/document-reference-r4";
import { BoxedAllergyIntolerance, FHIR_AllergyIntolerance, FHIR_AllergyIntolerance_A, FHIR_AllergyIntolerance_T } from "../summary/allergy-intolerance";
import { BoxedQuestionnaireResponse, FHIR_QuestionnaireResponse, FHIR_QuestionnaireResponse_A, FHIR_QuestionnaireResponse_T } from "../diagnostics/questionnaire-response";
import { BoxedMedication, BoxedMedicationStatement, FHIR_Medication, FHIR_MedicationStatement, FHIR_MedicationStatement_A, FHIR_MedicationStatement_T, FHIR_Medication_A, FHIR_Medication_T } from "../medications/medication-statement";

import { BoxedProvenance, FHIR_Provenance, FHIR_Provenance_A, FHIR_Provenance_T } from "../security/provenance";

import { BoxedConceptCollector, ConceptCollector_A, ConceptCollector_T } from "./concept-collector";


export const SupportedResource_T = t.union([
    FHIR_DocumentReference_T,
    FHIR_Encounter_T,
    FHIR_QuestionnaireResponse_T,
    FHIR_Questionnaire_T,
    FHIR_Patient_T,
    FHIR_Observation_T,
    FHIR_Practitioner_T,
    FHIR_PractitionerRole_T,
    FHIR_MedicationStatement_T,
    FHIR_Medication_T,
    FHIR_Condition_T,
    ConceptCollector_T,
    FHIR_AllergyIntolerance_T,
    FHIR_Provenance_T
]);

export type SupportedResource_A = FHIR_DocumentReference_A
                                | FHIR_Encounter_A
                                | FHIR_QuestionnaireResponse_A
                                | FHIR_Questionnaire_A
                                | FHIR_Patient_A
                                | FHIR_Observation_A
                                | FHIR_Practitioner_A
                                | FHIR_PractitionerRole_A
                                | FHIR_MedicationStatement_A
                                | FHIR_Medication_A
                                | FHIR_Condition_A
                                | ConceptCollector_A
                                | FHIR_AllergyIntolerance_A
                                | FHIR_Provenance_A;

export type SupportedResource   = FHIR_DocumentReference
                                | FHIR_Encounter
                                | FHIR_QuestionnaireResponse
                                | FHIR_Questionnaire
                                | FHIR_Patient
                                | FHIR_Observation
                                | FHIR_Practitioner
                                | FHIR_PractitionerRole
                                | FHIR_MedicationStatement
                                | FHIR_Medication
                                | FHIR_Condition
                                | FHIR_AllergyIntolerance
                                | FHIR_Provenance;

export type BSupportedResource  = BoxedDocumentReference
                                | BoxedEncounter
                                | BoxedQuestionnaireResponse
                                | BoxedQuestionnaire
                                | BoxedPatient
                                | BoxedObservation
                                | BoxedMedicationStatement
                                | BoxedMedication
                                | BoxedCondition
                                | BoxedConceptCollector
                                | BoxedAllergyIntolerance
                                | BoxedProvenance;
