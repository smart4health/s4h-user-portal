"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedResource_T = void 0;
/* eslint-disable max-len */
const t = __importStar(require("io-ts"));
const patient_1 = require("../individuals/patient");
const encounter_1 = require("../management/encounter");
const observation_1 = require("../diagnostics/observation");
const questionnaire_1 = require("../definitional-artifacts/questionnaire");
const document_reference_r4_1 = require("../documents/document-reference-r4");
const questionnaire_response_1 = require("../diagnostics/questionnaire-response");
const practitioner_role_1 = require("../individuals/practitioner-role");
const practitioner_1 = require("../individuals/practitioner");
exports.SupportedResource_T = t.union([
    document_reference_r4_1.FHIR_DocumentReference_T, encounter_1.FHIR_Encounter_T, questionnaire_response_1.FHIR_QuestionnaireResponse_T, questionnaire_1.FHIR_Questionnaire_T, patient_1.FHIR_Patient_T, observation_1.FHIR_Observation_T, practitioner_1.FHIR_Practitioner_T, practitioner_role_1.FHIR_PractitionerRole_T
]);
