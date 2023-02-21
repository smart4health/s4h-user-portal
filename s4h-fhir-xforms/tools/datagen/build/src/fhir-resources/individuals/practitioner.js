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
exports.FHIR_Practitioner_T = exports.FHIR_Practitioner_qualification_T = void 0;
const t = __importStar(require("io-ts"));
const primitives_1 = require("../base/primitives");
const general_special_purpose_1 = require("../base/general-special-purpose");
exports.FHIR_Practitioner_qualification_T = t.intersection([
    t.type({
        code: general_special_purpose_1.FHIR_CodeableConcept_T
    }),
    t.partial({
        identifier: t.array(general_special_purpose_1.FHIR_Identifier_T),
        period: general_special_purpose_1.FHIR_Period_T,
        issuer: general_special_purpose_1.FHIR_Reference_T
    })
]);
exports.FHIR_Practitioner_T = t.intersection([
    general_special_purpose_1.FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Practitioner")
    }),
    t.partial({
        active: primitives_1.FHIR_boolean_T,
        identifier: t.array(general_special_purpose_1.FHIR_Identifier_T),
        name: t.array(general_special_purpose_1.FHIR_HumanName_T),
        gender: t.keyof({
            "male": null,
            "female": null,
            "other": null,
            "unknown": null
        }),
        birthDate: primitives_1.FHIR_dateTime_T,
        telecom: t.array(general_special_purpose_1.FHIR_ContactPoint_T),
        address: t.array(general_special_purpose_1.FHIR_Address_T),
        photo: t.array(general_special_purpose_1.FHIR_Attachment_T),
        qualification: t.array(exports.FHIR_Practitioner_qualification_T),
        communication: t.array(general_special_purpose_1.FHIR_CodeableConcept_T)
    })
]);
