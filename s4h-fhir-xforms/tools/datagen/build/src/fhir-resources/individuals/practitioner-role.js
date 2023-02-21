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
exports.FHIR_PractitionerRole_T = exports.FHIR_PractitionerRole_notAvailable_T = exports.FHIR_PractitionerRole_availableTime_T = void 0;
const t = __importStar(require("io-ts"));
const primitives_1 = require("../base/primitives");
const general_special_purpose_1 = require("../base/general-special-purpose");
exports.FHIR_PractitionerRole_availableTime_T = t.partial({
    daysOfWeek: t.array(t.keyof({ mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null })),
    allDay: primitives_1.FHIR_boolean_T,
    availableStartTime: primitives_1.FHIR_time_T,
    availableEndTime: primitives_1.FHIR_time_T
});
exports.FHIR_PractitionerRole_notAvailable_T = t.intersection([
    t.type({
        description: primitives_1.FHIR_string_T
    }),
    t.partial({
        during: general_special_purpose_1.FHIR_Period_T
    })
]);
exports.FHIR_PractitionerRole_T = t.intersection([
    general_special_purpose_1.FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("PractitionerRole")
    }),
    t.partial({
        identifier: t.array(general_special_purpose_1.FHIR_Identifier_T),
        active: primitives_1.FHIR_boolean_T,
        period: general_special_purpose_1.FHIR_Period_T,
        practitioner: general_special_purpose_1.FHIR_Reference_T,
        organization: general_special_purpose_1.FHIR_Reference_T,
        code: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        specialty: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        location: t.array(general_special_purpose_1.FHIR_Reference_T),
        healthcareService: t.array(general_special_purpose_1.FHIR_Reference_T),
        telecom: t.array(general_special_purpose_1.FHIR_ContactPoint_T),
        availableTime: t.array(exports.FHIR_PractitionerRole_availableTime_T),
        notAvailable: t.array(exports.FHIR_PractitionerRole_notAvailable_T),
        availabilityExceptions: primitives_1.FHIR_string_T,
        endpoint: t.array(general_special_purpose_1.FHIR_Reference_T)
    })
]);
