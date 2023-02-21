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
exports.resolveObservationConceptTexts = exports.boxObservationResource = exports.FHIR_Observation_T = exports.FHIR_Observation_component_T = exports.FHIR_Observation_referenceRange_T = exports.FHIR_Observation_effective_T = exports.FHIR_Observation_effective_internal_T = exports.FHIR_Observation_value_T = exports.FHIR_Observation_value_internal_T = void 0;
const t = __importStar(require("io-ts"));
const O = __importStar(require("fp-ts/Option"));
const fp_tools_1 = require("../../utils/fp-tools");
const primitives_1 = require("../base/primitives");
const general_special_purpose_1 = require("../base/general-special-purpose");
exports.FHIR_Observation_value_internal_T = t.union([
    t.type({ _valueTag: t.literal("none") }),
    t.type({ _valueTag: t.literal("valueQuantity"), valueQuantity: general_special_purpose_1.FHIR_Quantity_T }, "valueQuantity"),
    t.type({ _valueTag: t.literal("valueCodeableConcept"), valueCodeableConcept: general_special_purpose_1.FHIR_CodeableConcept_T }, "valueCodeableConcept"),
    t.type({ _valueTag: t.literal("valueString"), valueString: primitives_1.FHIR_string_T }, "valueString"),
    t.type({ _valueTag: t.literal("valueBoolean"), valueBoolean: primitives_1.FHIR_boolean_T }, "valueBoolean"),
    t.type({ _valueTag: t.literal("valueInteger"), valueInteger: primitives_1.FHIR_integer_T }, "valueInteger"),
    t.type({ _valueTag: t.literal("valueRange"), valueRange: general_special_purpose_1.FHIR_Range_T }, "valueRange"),
    t.type({ _valueTag: t.literal("valueRatio"), valueRatio: general_special_purpose_1.FHIR_Ratio_T }, "valueRatio"),
    t.type({ _valueTag: t.literal("valueSampledData"), valueSampledData: general_special_purpose_1.FHIR_SampledData_T }, "valueSampledData"),
    t.type({ _valueTag: t.literal("valueTime"), valueTime: primitives_1.FHIR_time_T }, "valueTime"),
    t.type({ _valueTag: t.literal("valueDateTime"), valueDateTime: primitives_1.FHIR_dateTime_T }, "valueDateTime"),
    t.type({ _valueTag: t.literal("valuePeriod"), valuePeriod: general_special_purpose_1.FHIR_Period_T }, "valuePeriod")
]);
exports.FHIR_Observation_value_T = fp_tools_1.makeTaggedUnionTypeClass(exports.FHIR_Observation_value_internal_T, "FHIR_Observation_value_internal_T", "_valueTag");
exports.FHIR_Observation_effective_internal_T = t.union([
    t.type({ _effectiveTag: t.literal("none") }),
    t.type({ _effectiveTag: t.literal("effectiveDateTime"), effectiveDateTime: primitives_1.FHIR_dateTime_T }, "effectiveDateTime"),
    t.type({ _effectiveTag: t.literal("effectivePeriod"), effectivePeriod: general_special_purpose_1.FHIR_Period_T }, "effectivePeriod"),
    t.type({ _effectiveTag: t.literal("effectiveTiming"), effectiveTiming: general_special_purpose_1.FHIR_Timing_T }, "effectiveTiming"),
    t.type({ _effectiveTag: t.literal("effectiveInstant"), effectiveInstant: primitives_1.FHIR_instant_T }, "effectiveInstant")
]);
exports.FHIR_Observation_effective_T = fp_tools_1.makeTaggedUnionTypeClass(exports.FHIR_Observation_effective_internal_T, "FHIR_Observation_effective_internal_T", "_effectiveTag");
exports.FHIR_Observation_referenceRange_T = t.partial({
    low: general_special_purpose_1.FHIR_SimpleQuantity_T,
    high: general_special_purpose_1.FHIR_SimpleQuantity_T,
    type: general_special_purpose_1.FHIR_CodeableConcept_T,
    appliesTo: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
    age: general_special_purpose_1.FHIR_Range_T,
    text: primitives_1.FHIR_string_T
});
exports.FHIR_Observation_component_T = t.intersection([
    t.type({
        code: general_special_purpose_1.FHIR_CodeableConcept_T
    }),
    exports.FHIR_Observation_value_T,
    t.partial({
        dataAbsentReason: general_special_purpose_1.FHIR_CodeableConcept_T,
        interpretation: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        referenceRange: t.array(exports.FHIR_Observation_referenceRange_T)
    })
]);
exports.FHIR_Observation_T = t.intersection([
    general_special_purpose_1.FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Observation"),
        subject: general_special_purpose_1.FHIR_Reference_T,
        status: t.keyof({
            "registered": null,
            "preliminary": null,
            "final": null,
            "amended": null
        })
    }),
    exports.FHIR_Observation_effective_T,
    exports.FHIR_Observation_value_T,
    t.partial({
        // meta:             FHIR_Meta_T,
        identifier: t.array(general_special_purpose_1.FHIR_Identifier_T),
        basedOn: t.array(general_special_purpose_1.FHIR_Reference_T),
        partOf: t.array(general_special_purpose_1.FHIR_Reference_T),
        category: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        code: general_special_purpose_1.FHIR_CodeableConcept_T,
        focus: t.array(general_special_purpose_1.FHIR_Reference_T),
        encounter: general_special_purpose_1.FHIR_Reference_T,
        issued: primitives_1.FHIR_instant_T,
        performer: t.array(general_special_purpose_1.FHIR_Reference_T),
        dataAbsentReason: general_special_purpose_1.FHIR_CodeableConcept_T,
        interpretation: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        note: t.array(general_special_purpose_1.FHIR_Annotation_T),
        bodySite: general_special_purpose_1.FHIR_CodeableConcept_T,
        method: general_special_purpose_1.FHIR_CodeableConcept_T,
        specimen: general_special_purpose_1.FHIR_Reference_T,
        device: general_special_purpose_1.FHIR_Reference_T,
        referenceRange: t.array(exports.FHIR_Observation_referenceRange_T),
        hasMember: t.array(general_special_purpose_1.FHIR_Reference_T),
        derivedFrom: t.array(general_special_purpose_1.FHIR_Reference_T),
        component: t.array(exports.FHIR_Observation_component_T)
    })
]);
function boxObservationResource(res) {
    return {
        boxed: res,
        code: O.none,
        valueCodeableConcept: O.none
    };
}
exports.boxObservationResource = boxObservationResource;
function resolveObservationConceptTexts(resolver, res) {
    if (res.boxed.code) {
        resolver(res.boxed.code).then(os => { res.code = os; });
    }
    if (res.boxed._valueTag === "valueCodeableConcept") {
        resolver(res.boxed.valueCodeableConcept).then(os => { res.valueCodeableConcept = os; });
    }
}
exports.resolveObservationConceptTexts = resolveObservationConceptTexts;
