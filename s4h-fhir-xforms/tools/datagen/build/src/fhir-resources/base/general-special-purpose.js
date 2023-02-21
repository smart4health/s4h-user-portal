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
exports.FHIR_DomainResource_T = exports.FHIR_Narrative_T = exports.FHIR_Resource_T = exports.FHIR_Meta_T = exports.FHIR_Attachment_T = exports.FHIR_Timing_T = exports.FHIR_Timing_Repeat_T = exports.FHIR_Timing_Repeat_Bounds_T = exports.FHIR_Timing_Repeat_Bounds_internal_T = exports.FHIR_SampledData_T = exports.FHIR_Money_T = exports.FHIR_Annotation_T = exports.FHIR_Reference_T = exports.FHIR_Address_T = exports.FHIR_Ratio_T = exports.FHIR_Range_T = exports.FHIR_ContactPoint_T = exports.FHIR_HumanName_T = exports.eqIdentifier = exports.FHIR_Identifier_T = exports.FHIR_Period_T = exports.FHIR_SimpleQuantity_T = exports.FHIR_Duration_T = exports.FHIR_Quantity_T = exports.FHIR_Extension_T = exports.FHIR_Extension_value_T = exports.FHIR_Extension_value_internal_T = exports.FHIR_CodeableConcept_T = exports.FHIR_CodeableConcept_TC = exports.Array_FHIR_Coding_T = exports.FHIR_Coding_T = exports.FHIR_Element_T = void 0;
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-explicit-any */
const t = __importStar(require("io-ts"));
const E = __importStar(require("fp-ts/Either"));
const fp_tools_1 = require("../../utils/fp-tools");
const primitives_1 = require("./primitives");
exports.FHIR_Element_T = t.recursion("FHIR_Element", () => t.partial({
    id: primitives_1.FHIR_string_T,
    extension: t.array(exports.FHIR_Extension_T)
}));
exports.FHIR_Coding_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        system: primitives_1.FHIR_uri_T,
        version: primitives_1.FHIR_string_T,
        code: primitives_1.FHIR_code_T,
        display: primitives_1.FHIR_string_T,
        userSelected: primitives_1.FHIR_boolean_T
    })
]);
exports.Array_FHIR_Coding_T = t.array(exports.FHIR_Coding_T);
// eslint-disable-next-line max-len
class FHIR_CodeableConcept_TC extends t.Type {
    constructor() {
        super("FHIR_CodeableConcept_TC", 
        // is
        (x) => E.isRight(this.decode(x)), 
        // decode
        (x, c) => {
            var _a;
            if (((_a = x === null || x === void 0 ? void 0 : x.constructor) === null || _a === void 0 ? void 0 : _a.name) === "Object") {
                if ((typeof x.coding === "undefined") && (typeof x.text === "undefined")) {
                    return t.failure(x, c, "both 'coding' and 'text' are missing");
                }
                const result = {};
                if (typeof x.coding !== "undefined") {
                    const coding = t.array(exports.FHIR_Coding_T).decode(x.coding);
                    if (E.isLeft(coding)) {
                        return coding;
                    }
                    // TODO: add constraint to no tolerate empty coding arrays
                    result.coding = coding.right;
                }
                if (typeof x.text !== "undefined") {
                    const text = primitives_1.FHIR_string_T.decode(x.text);
                    if (E.isLeft(text)) {
                        return text;
                    }
                    result.text = text.right;
                }
                return t.success(result);
            }
            else {
                return t.failure(x, c, "value is not an object");
            }
        }, 
        // encode
        (obj) => {
            const result = {};
            if (typeof obj.coding !== "undefined") {
                result.coding = obj.coding;
            }
            if (typeof obj.text !== "undefined") {
                result.text = obj.text;
            }
            return result;
        });
    }
}
exports.FHIR_CodeableConcept_TC = FHIR_CodeableConcept_TC;
exports.FHIR_CodeableConcept_T = new FHIR_CodeableConcept_TC();
exports.FHIR_Extension_value_internal_T = t.union([
    t.type({ _valueTag: t.literal("none") }),
    t.type({ _valueTag: t.literal("valueBase64Binary"), valueBase64Binary: primitives_1.FHIR_base64Binary_T }, "valueBase64Binary"),
    t.type({ _valueTag: t.literal("valueBoolean"), valueBoolean: primitives_1.FHIR_boolean_T }, "valueBoolean"),
    t.type({ _valueTag: t.literal("valueCanonical"), valueCanonical: primitives_1.FHIR_canonical_T }, "valueCanonical"),
    t.type({ _valueTag: t.literal("valueCode"), valueCode: primitives_1.FHIR_code_T }, "valueCode"),
    t.type({ _valueTag: t.literal("valueDate"), valueDate: primitives_1.FHIR_date_T }, "valueDate"),
    t.type({ _valueTag: t.literal("valueDateTime"), valueDateTime: primitives_1.FHIR_dateTime_T }, "valueDateTime"),
    t.type({ _valueTag: t.literal("valueCodeableConcept"), valueCodeableConcept: exports.FHIR_CodeableConcept_T }, "valueCodeableConcept"),
    t.type({ _valueTag: t.literal("valueString"), valueString: primitives_1.FHIR_string_T }, "valueString"),
    t.type({ _valueTag: t.literal("valueInteger"), valueInteger: primitives_1.FHIR_integer_T }, "valueInteger")
]);
exports.FHIR_Extension_value_T = fp_tools_1.makeTaggedUnionTypeClass(exports.FHIR_Extension_value_internal_T, "FHIR_Extension_value_internal_T", "_valueTag");
exports.FHIR_Extension_T = t.recursion("FHIR_Extension_T", () => t.intersection([
    exports.FHIR_Element_T,
    exports.FHIR_Extension_value_T,
    t.type({
        url: primitives_1.FHIR_uri_T
    })
]));
exports.FHIR_Quantity_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        value: primitives_1.FHIR_decimal_T,
        comparator: t.keyof({
            "<": null,
            "<=": null,
            ">=": null,
            ">": null
        }),
        unit: primitives_1.FHIR_string_T,
        system: primitives_1.FHIR_uri_T,
        code: primitives_1.FHIR_code_T
    })
]);
exports.FHIR_Duration_T = exports.FHIR_Quantity_T; // FIXME
exports.FHIR_SimpleQuantity_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        value: primitives_1.FHIR_decimal_T,
        unit: primitives_1.FHIR_string_T,
        system: primitives_1.FHIR_uri_T,
        code: primitives_1.FHIR_code_T
    })
]);
exports.FHIR_Period_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        start: primitives_1.FHIR_dateTime_T,
        end: primitives_1.FHIR_dateTime_T
    })
]);
exports.FHIR_Identifier_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        use: t.keyof({
            "usual": null,
            "official": null,
            "temp": null,
            "secondary": null,
            "old": null
        }),
        type: exports.FHIR_CodeableConcept_T,
        system: primitives_1.FHIR_uri_T,
        value: primitives_1.FHIR_string_T,
        period: exports.FHIR_Period_T
        // Keep assigner out as it introduces a cyclic dependency.
        // Tackle it when needed.
        // assigner: FHIR_Reference_T
    })
]);
exports.eqIdentifier = {
    equals: (x, y) => x.system === y.system && x.value === y.value
};
exports.FHIR_HumanName_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        use: t.keyof({
            "usual": null,
            "official": null,
            "temp": null,
            "nickname": null,
            "anonymous": null,
            "old": null,
            "maiden": null
        }),
        text: primitives_1.FHIR_string_T,
        family: primitives_1.FHIR_string_T,
        given: t.array(primitives_1.FHIR_string_T),
        prefix: t.array(primitives_1.FHIR_string_T),
        suffix: t.array(primitives_1.FHIR_string_T),
        period: exports.FHIR_Period_T
    })
]);
exports.FHIR_ContactPoint_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        system: t.keyof({
            "phone": null,
            "fax": null,
            "email": null,
            "pager": null,
            "url": null,
            "sms": null,
            "other": null
        }),
        value: primitives_1.FHIR_string_T,
        use: t.keyof({
            "home": null,
            "work": null,
            "temp": null,
            "old": null,
            "mobile": null
        }),
        rank: primitives_1.FHIR_positiveInt_T,
        period: exports.FHIR_Period_T
    })
]);
exports.FHIR_Range_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        low: exports.FHIR_Quantity_T,
        high: exports.FHIR_Quantity_T
    })
]);
exports.FHIR_Ratio_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        numerator: exports.FHIR_Quantity_T,
        denominator: exports.FHIR_Quantity_T
    })
]);
exports.FHIR_Address_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        use: t.keyof({
            "home": null,
            "work": null,
            "temp": null,
            "old": null,
            "billing": null
        }),
        type: t.keyof({
            "postal": null,
            "physical": null,
            "both": null
        }),
        text: primitives_1.FHIR_string_T,
        line: t.array(primitives_1.FHIR_string_T),
        city: primitives_1.FHIR_string_T,
        district: primitives_1.FHIR_string_T,
        state: primitives_1.FHIR_string_T,
        postalCode: primitives_1.FHIR_string_T,
        country: primitives_1.FHIR_string_T,
        period: exports.FHIR_Period_T
    })
]);
exports.FHIR_Reference_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        reference: primitives_1.FHIR_string_T,
        type: primitives_1.FHIR_uri_T,
        identifier: exports.FHIR_Identifier_T,
        display: primitives_1.FHIR_string_T
    })
]);
exports.FHIR_Annotation_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        authorString: primitives_1.FHIR_string_T,
        authorReference: exports.FHIR_Reference_T,
        time: primitives_1.FHIR_dateTime_T,
        text: primitives_1.FHIR_markdown_T
    })
]);
exports.FHIR_Money_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        value: primitives_1.FHIR_decimal_T,
        currency: primitives_1.FHIR_code_T
    })
]);
exports.FHIR_SampledData_T = t.intersection([
    exports.FHIR_Element_T,
    t.type({
        origin: exports.FHIR_SimpleQuantity_T,
        period: primitives_1.FHIR_decimal_T,
        dimensions: primitives_1.FHIR_positiveInt_T
    }),
    t.partial({
        factor: primitives_1.FHIR_decimal_T,
        lowerLimit: primitives_1.FHIR_decimal_T,
        upperLimit: primitives_1.FHIR_decimal_T,
        data: primitives_1.FHIR_string_T
    })
]);
exports.FHIR_Timing_Repeat_Bounds_internal_T = t.union([
    t.type({ _boundsTag: t.literal("none") }),
    t.type({ _boundsTag: t.literal("boundsDuration"), boundsDuration: exports.FHIR_Duration_T }, "boundsDuration"),
    t.type({ _boundsTag: t.literal("boundsRange"), boundsRange: exports.FHIR_Range_T }, "boundsRange"),
    t.type({ _boundsTag: t.literal("boundsPeriod"), boundsPeriod: exports.FHIR_Period_T }, "boundsPeriod")
]);
exports.FHIR_Timing_Repeat_Bounds_T = fp_tools_1.makeTaggedUnionTypeClass(exports.FHIR_Timing_Repeat_Bounds_internal_T, "FHIR_Timing_Repeat_Bounds_internal_T", "_boundsTag");
exports.FHIR_Timing_Repeat_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        count: primitives_1.FHIR_positiveInt_T,
        countMax: primitives_1.FHIR_positiveInt_T,
        duration: primitives_1.FHIR_decimal_T,
        durationMax: primitives_1.FHIR_decimal_T,
        durationUnit: t.keyof({ s: null, min: null, h: null, d: null, wk: null, mo: null, a: null }),
        frequency: primitives_1.FHIR_positiveInt_T,
        frequencyMax: primitives_1.FHIR_positiveInt_T,
        period: primitives_1.FHIR_decimal_T,
        periodMax: primitives_1.FHIR_decimal_T,
        periodUnit: t.keyof({ s: null, min: null, h: null, d: null, wk: null, mo: null, a: null }),
        dayOfWeek: t.array(t.keyof({ mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null })),
        timeOfDay: t.array(primitives_1.FHIR_time_T),
        when: t.array(primitives_1.FHIR_code_T),
        offset: primitives_1.FHIR_unsignedInt_T
    }),
    exports.FHIR_Timing_Repeat_Bounds_T
]);
exports.FHIR_Timing_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        event: t.array(primitives_1.FHIR_dateTime_T),
        repeat: exports.FHIR_Timing_Repeat_T,
        code: exports.FHIR_CodeableConcept_T
    })
]);
exports.FHIR_Attachment_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        contentType: primitives_1.FHIR_code_T,
        language: primitives_1.FHIR_code_T,
        data: primitives_1.FHIR_base64Binary_T,
        url: primitives_1.FHIR_url_T,
        size: primitives_1.FHIR_unsignedInt_T,
        hash: primitives_1.FHIR_base64Binary_T,
        title: primitives_1.FHIR_string_T,
        creation: primitives_1.FHIR_dateTime_T,
        // SDK deviation
        file: t.unknown
    })
]);
exports.FHIR_Meta_T = t.intersection([
    exports.FHIR_Element_T,
    t.partial({
        versionId: primitives_1.FHIR_id_T,
        lastUpdated: primitives_1.FHIR_instant_T,
        source: primitives_1.FHIR_uri_T,
        profile: t.array(primitives_1.FHIR_canonical_T),
        security: t.array(exports.FHIR_Coding_T),
        tag: t.array(exports.FHIR_Coding_T)
    })
]);
exports.FHIR_Resource_T = t.intersection([
    t.type({
        resourceType: primitives_1.FHIR_code_T
    }),
    t.partial({
        id: primitives_1.FHIR_id_T,
        meta: exports.FHIR_Meta_T,
        implicitRules: primitives_1.FHIR_uri_T,
        language: primitives_1.FHIR_code_T
    })
]);
exports.FHIR_Narrative_T = t.intersection([
    exports.FHIR_Element_T,
    t.type({
        status: t.keyof({
            "generated": null,
            "extensions": null,
            "additional": null,
            "empty": null
        }),
        div: primitives_1.FHIR_xhtml_T
    })
]);
exports.FHIR_DomainResource_T = t.intersection([
    exports.FHIR_Resource_T,
    t.partial({
        text: exports.FHIR_Narrative_T,
        contained: t.array(exports.FHIR_Resource_T),
        extension: t.array(exports.FHIR_Extension_T),
        modifierExtension: t.array(exports.FHIR_Extension_T)
    })
]);
