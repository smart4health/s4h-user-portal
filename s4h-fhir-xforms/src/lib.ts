/* eslint-disable indent */

/*
 * FHIR resources
 */
export { FHIR_Patient } from "./fhir-resources/individuals/patient";
export { FHIR_Practitioner } from "./fhir-resources/individuals/practitioner";
export { FHIR_PractitionerRole } from "./fhir-resources/individuals/practitioner-role";
export { FHIR_DocumentReference } from "./fhir-resources/documents/document-reference-r4";
export { FHIR_Questionnaire } from "./fhir-resources/definitional-artifacts/questionnaire";
export { FHIR_Observation } from "./fhir-resources/diagnostics/observation";
export { FHIR_QuestionnaireResponse } from "./fhir-resources/diagnostics/questionnaire-response";
export { FHIR_Encounter } from "./fhir-resources/management/encounter";
export { FHIR_ValueSet } from "./fhir-resources/terminology/value-set";
export { FHIR_Condition } from "./fhir-resources/summary/condition";
export { FHIR_Provenance } from "./fhir-resources/security/provenance";

/*
 * FHIR-to-UI
 */

// General types
export { Issue, IssueList } from "./utils/issues";
export * from "./utils/errors";


// Group derivation
export * from "./transformations/group-list/defs";
export * from "./transformations/group-list/public-api";

// Medical history
export * from "./transformations/medical-history/defs";
export * from "./transformations/medical-history/public-api";

// Medications
export * from "./transformations/medications/defs";
export * from "./transformations/medications/public-api";

// Problem list
export * from "./transformations/problem-list/defs";
export * from "./transformations/problem-list/public-api";

// Provenance
export * from "./transformations/provenance/defs";
export * from "./transformations/provenance/public-api";

/*
 * UI-to-FHIR
 */

// DocumentReference operations
export * from "./transformations/document-reference/ui2fhir/docRef";

// Tagging
export * from "./transformations/tagging/tagging";

/*
 * Code systems and value sets
 */

// Code systems
export * from "./resolve-codings/code-systems/defs";
export * from "./resolve-codings/code-systems/canned/canned";
export * from "./resolve-codings/code-systems/codings-service/codings-service";
export * from "./resolve-codings/code-systems/sequence/sequence";
export * from "./resolve-codings/code-systems/static-resource/static-resource";

// Value sets
export * from "./resolve-codings/value-sets/defs";
export * from "./resolve-codings/value-sets/canned/canned";
export * from "./resolve-codings/value-sets/codings-service/codings-service";
export * from "./resolve-codings/value-sets/sequence/sequence";

// Experimental
export { getResources, ResourcePoolOptions } from "./transformations/syncer/resource-pool";

// Mocks
export * from "./utils/sdk-mocks";
