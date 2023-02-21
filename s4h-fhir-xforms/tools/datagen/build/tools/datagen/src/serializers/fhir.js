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
exports.FhirSerializer = exports.convertPostSessionQuestionnaireResponse = exports.convertPreSessionQuestionnaireResponse = exports.convertWeightObservation = exports.convertHeightObservation = exports.convertPatient = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mkdirp = __importStar(require("mkdirp"));
const faker = __importStar(require("faker"));
const patient_1 = require("../../../../src/fhir-resources/individuals/patient");
const observation_1 = require("../../../../src/fhir-resources/diagnostics/observation");
const questionnaire_response_1 = require("../../../../src/fhir-resources/diagnostics/questionnaire-response");
const utils_1 = require("../utils");
function convertPatient(p) {
    const monthDayYear = utils_1.numericYearToYearMonthDay(p.birthDay);
    return {
        resourceType: "Patient",
        id: p.id,
        name: [
            {
                family: p.lastName,
                given: [p.firstName]
            }
        ],
        address: [{
                country: p.country
            }],
        gender: p.gender,
        birthDate: Object.assign({ kind: "YYYY-MM-DD" }, monthDayYear),
        _deceasedTag: "none",
        _multipleBirthTag: "none"
    };
}
exports.convertPatient = convertPatient;
function convertHeightObservation(p) {
    return {
        resourceType: "Observation",
        id: faker.random.uuid(),
        status: "amended",
        subject: {
            reference: "Patient/" + p.id
        },
        code: { coding: [{ system: "http://loinc.org", code: "8302-2" }] },
        _effectiveTag: "none",
        _valueTag: "valueQuantity",
        valueQuantity: {
            value: Math.round(p.height),
            unit: "cm"
        }
    };
}
exports.convertHeightObservation = convertHeightObservation;
function convertWeightObservation(p) {
    return {
        resourceType: "Observation",
        id: faker.random.uuid(),
        status: "amended",
        subject: {
            reference: "Patient/" + p.id
        },
        code: { coding: [{ system: "http://loinc.org", code: "29463-7" }] },
        _effectiveTag: "none",
        _valueTag: "valueQuantity",
        valueQuantity: {
            value: Math.round(p.weight),
            unit: "kg"
        }
    };
}
exports.convertWeightObservation = convertWeightObservation;
function convertPreSessionQuestionnaireResponse(recipe, patient) {
    return {
        resourceType: "QuestionnaireResponse",
        id: faker.random.uuid(),
        language: "en",
        questionnaire: "http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire|0.1.0",
        status: "completed",
        item: [{
                linkId: "current_back_pain_level",
                text: "Please indicate your current pain level",
                answer: [{
                        _valueTag: "valueCoding",
                        "valueCoding": recipe.value_sets.pain_scale[patient.preSession.painLevel]
                    }]
            },
            {
                linkId: "average_back_pain_level",
                text: "Please indicate your average pain level during the past four weeks",
                answer: [{
                        _valueTag: "valueCoding",
                        valueCoding: recipe.value_sets.pain_scale[patient.preSession.painLevel]
                    }]
            },
            {
                linkId: "max_back_pain_level_4w",
                text: "Please indicate your maximum pain level during the past four weeks",
                answer: [{
                        _valueTag: "valueCoding",
                        valueCoding: recipe.value_sets.pain_scale[patient.preSession.painLevel]
                    }]
            },
            {
                linkId: "taking_painkillers",
                text: "Are you taking painkillers at the moment?",
                answer: [{
                        _valueTag: "valueCoding",
                        valueCoding: recipe.value_sets.painkillers[patient.preSession.painKillers ? 1 : 0]
                    }]
            }
        ]
    };
}
exports.convertPreSessionQuestionnaireResponse = convertPreSessionQuestionnaireResponse;
function convertPostSessionQuestionnaireResponse(recipe, patient) {
    return {
        "resourceType": "QuestionnaireResponse",
        "id": faker.random.uuid(),
        "language": "en",
        "questionnaire": "http://fhir.smart4health.eu/Questionnaire/post-session-questionnaire|0.1.0",
        "status": "completed",
        "item": [{
                "linkId": "current_pain_level",
                "text": "Please indicate your current pain level",
                "answer": [{
                        _valueTag: "valueCoding",
                        valueCoding: recipe.value_sets.pain_scale[patient.postSession.painLevel]
                    }]
            },
            {
                "linkId": "average_pain_level",
                "text": "Please indicate your average pain level during the past four weeks",
                "answer": [{
                        _valueTag: "valueCoding",
                        valueCoding: recipe.value_sets.pain_scale[patient.postSession.painLevel]
                    }]
            },
            {
                "linkId": "maximimum_pain_level",
                "text": "Please indicate your maximum pain level during the past four weeks",
                "answer": [{
                        _valueTag: "valueCoding",
                        valueCoding: recipe.value_sets.pain_scale[patient.postSession.painLevel]
                    }]
            },
            {
                "linkId": "lower_backpain_reduced",
                "text": "Can you estimate (in percent %) how much your pain relieved?",
                "answer": [{
                        _valueTag: "valueDecimal",
                        "valueDecimal": 12
                    }]
            },
            {
                "linkId": "treatment_success",
                "text": "Taken together, what is your impression on your present treatment success?",
                "answer": [{
                        _valueTag: "valueCoding",
                        "valueCoding": {
                            "system": "http://loinc.org",
                            "code": "LA8967-7"
                        }
                    }]
            },
            {
                "linkId": "taking_painkillers",
                "text": "Are you taking painkillers at the moment?",
                "answer": [{
                        _valueTag: "valueCoding",
                        valueCoding: recipe.value_sets.painkillers[patient.postSession.painKillers ? 1 : 0]
                    }]
            }
        ]
    };
}
exports.convertPostSessionQuestionnaireResponse = convertPostSessionQuestionnaireResponse;
class FhirSerializer {
    init(dataRootDir, recipe) {
        console.log(`writing patients to location ${dataRootDir}`);
        this.dataRootDir = dataRootDir;
        this.recipe = recipe;
    }
    serializePatient(patient) {
        const patientPath = path.resolve(this.dataRootDir, patient.id);
        mkdirp.sync(patientPath);
        fs.writeFileSync(path.resolve(patientPath, `patient.patient.json`), JSON.stringify(patient_1.FHIR_Patient_T.encode(convertPatient(patient)), undefined, "\t"));
        fs.writeFileSync(path.resolve(patientPath, `weight.observation.json`), JSON.stringify(observation_1.FHIR_Observation_T.encode(convertWeightObservation(patient)), undefined, "\t"));
        fs.writeFileSync(path.resolve(patientPath, `height.observation.json`), JSON.stringify(observation_1.FHIR_Observation_T.encode(convertHeightObservation(patient)), undefined, "\t"));
        if (patient.preSession) {
            fs.writeFileSync(path.resolve(patientPath, `pre-session.questionnaire-response.json`), JSON.stringify(questionnaire_response_1.FHIR_QuestionnaireResponse_T.encode(convertPreSessionQuestionnaireResponse(this.recipe, patient)), undefined, "\t"));
        }
        if (patient.postSession) {
            fs.writeFileSync(path.resolve(patientPath, `post-session.questionnaire-response.json`), JSON.stringify(questionnaire_response_1.FHIR_QuestionnaireResponse_T.encode(convertPostSessionQuestionnaireResponse(this.recipe, patient)), undefined, "\t"));
        }
    }
    done() {
    }
}
exports.FhirSerializer = FhirSerializer;
