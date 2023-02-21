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
exports.resolveEncounterConceptTexts = exports.boxEncounterResource = exports.insertEncounterResource = exports.FHIR_Encounter_T = exports.FHIR_Encounter_location_T = exports.T_Encounter_hospitalization_T = exports.FHIR_Encounter_diagnosis_T = exports.FHIR_Encounter_participant_T = exports.FHIR_Encounter_classHistory_T = exports.FHIR_Encounter_statusHistory_T = void 0;
const t = __importStar(require("io-ts"));
const A = __importStar(require("fp-ts/Array"));
const graph_1 = require("../../graph/graph");
const primitives_1 = require("../base/primitives");
const issues_1 = require("../../utils/issues");
const general_special_purpose_1 = require("../base/general-special-purpose");
exports.FHIR_Encounter_statusHistory_T = t.type({
    status: primitives_1.FHIR_code_T,
    period: general_special_purpose_1.FHIR_Period_T
});
exports.FHIR_Encounter_classHistory_T = t.type({
    class: general_special_purpose_1.FHIR_Coding_T,
    period: general_special_purpose_1.FHIR_Period_T
});
exports.FHIR_Encounter_participant_T = t.partial({
    type: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
    period: general_special_purpose_1.FHIR_Period_T,
    individual: general_special_purpose_1.FHIR_Reference_T
});
exports.FHIR_Encounter_diagnosis_T = t.intersection([
    t.type({
        condition: general_special_purpose_1.FHIR_Reference_T
    }),
    t.partial({
        use: general_special_purpose_1.FHIR_CodeableConcept_T,
        rank: primitives_1.FHIR_positiveInt_T
    })
]);
exports.T_Encounter_hospitalization_T = t.partial({
    preAdministrationIdentifier: general_special_purpose_1.FHIR_Identifier_T,
    origin: general_special_purpose_1.FHIR_Reference_T,
    admitSource: general_special_purpose_1.FHIR_CodeableConcept_T,
    reAdmission: general_special_purpose_1.FHIR_CodeableConcept_T,
    dietPreference: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
    specialCourtesy: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
    specialArrangement: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
    destination: general_special_purpose_1.FHIR_Reference_T,
    dischargeDisposition: general_special_purpose_1.FHIR_CodeableConcept_T
});
exports.FHIR_Encounter_location_T = t.intersection([
    t.type({
        location: general_special_purpose_1.FHIR_Reference_T
    }),
    t.partial({
        status: primitives_1.FHIR_code_T,
        physicalType: general_special_purpose_1.FHIR_CodeableConcept_T,
        period: general_special_purpose_1.FHIR_Period_T
    })
]);
exports.FHIR_Encounter_T = t.intersection([
    general_special_purpose_1.FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Encounter"),
        identifier: t.array(general_special_purpose_1.FHIR_Identifier_T),
        status: t.keyof({
            "planned": null,
            "arrived": null,
            "triaged": null,
            "in-progress": null,
            "onleave": null,
            "finished": null,
            "cancelled": null,
            "entered-in-error": null,
            "unknown": null
        }),
        class: general_special_purpose_1.FHIR_Coding_T
    }),
    t.partial({
        statusHistory: t.array(exports.FHIR_Encounter_statusHistory_T),
        classHistory: t.array(exports.FHIR_Encounter_classHistory_T),
        type: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        serviceType: general_special_purpose_1.FHIR_CodeableConcept_T,
        priority: general_special_purpose_1.FHIR_CodeableConcept_T,
        subject: general_special_purpose_1.FHIR_Reference_T,
        episodeOfCare: t.array(general_special_purpose_1.FHIR_Reference_T),
        basedOn: t.array(general_special_purpose_1.FHIR_Reference_T),
        participant: t.array(exports.FHIR_Encounter_participant_T),
        appointment: t.array(general_special_purpose_1.FHIR_Reference_T),
        period: general_special_purpose_1.FHIR_Period_T,
        length: general_special_purpose_1.FHIR_Duration_T,
        reasonCode: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        reasonReference: t.array(general_special_purpose_1.FHIR_Reference_T),
        diagnosis: t.array(exports.FHIR_Encounter_diagnosis_T),
        account: general_special_purpose_1.FHIR_Reference_T,
        hospitalization: exports.T_Encounter_hospitalization_T,
        location: exports.FHIR_Encounter_location_T,
        serviceProvider: general_special_purpose_1.FHIR_Reference_T,
        partOf: general_special_purpose_1.FHIR_Reference_T
    })
]);
function insertEncounterResource(g, boxres) {
    var _a, _b;
    const issues = [];
    const res = boxres.boxed;
    try {
        if (((_a = res.identifier) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            const n = new graph_1.RefNode(res.identifier, boxres);
            g.addNode(n);
            if ((_b = res.partOf) === null || _b === void 0 ? void 0 : _b.identifier) {
                g.addEdge(res.identifier[0], res.partOf.identifier, "partOf");
            }
        }
        else {
            issues.push(issues_1.issueWarningStageB("encounter without identifier", { resource: res }));
        }
    }
    catch (error) {
        issues.push(issues_1.issueErrorStageB(error.message, { resource: res }));
    }
    return issues;
}
exports.insertEncounterResource = insertEncounterResource;
function boxEncounterResource(res) {
    return { boxed: res, type: [] };
}
exports.boxEncounterResource = boxEncounterResource;
function resolveEncounterConceptTexts(resolver, res) {
    if (res.boxed.type) {
        Promise.all(A.map(resolver)(res.boxed.type))
            .then(texts => { res.type = texts; });
    }
}
exports.resolveEncounterConceptTexts = resolveEncounterConceptTexts;
