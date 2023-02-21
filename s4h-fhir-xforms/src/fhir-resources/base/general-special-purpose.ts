/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from "io-ts";
import { Eq } from "fp-ts/Eq";
import * as E from "fp-ts/Either";

import { DistributiveOmit, makeTaggedUnionTypeClass } from "../../utils/fp-tools";

import { FHIR_base64Binary, FHIR_base64Binary_A, FHIR_base64Binary_T, FHIR_boolean, FHIR_boolean_A, FHIR_boolean_T, FHIR_canonical, FHIR_canonical_A, FHIR_canonical_T, FHIR_code, FHIR_code_A, FHIR_code_T, FHIR_date, FHIR_dateTime, FHIR_dateTime_A, FHIR_dateTime_T, FHIR_date_A, FHIR_date_T, FHIR_decimal_T, FHIR_id_T, FHIR_instant_T, FHIR_integer, FHIR_integer_A, FHIR_integer_T, FHIR_markdown_T, FHIR_positiveInt_T, FHIR_string, FHIR_string_A, FHIR_string_T, FHIR_time_T, FHIR_unsignedInt_T, FHIR_uri_T, FHIR_url_T, FHIR_xhtml_T } from "./primitives";



export type FHIR_Element = {
    id?: string;
    extension?: Array<FHIR_Extension>;
};

export type FHIR_Element_A = {
    id?: string;
    extension?: Array<FHIR_Extension_A>;
};



export interface FHIR_Extension extends FHIR_Element {
    url: string;

    valueBase64Binary?:    FHIR_base64Binary;
    valueBoolean?:         FHIR_boolean;
    valueCanonical?:       FHIR_canonical;
    valueCode?:            FHIR_code;
    valueDate?:            FHIR_date;
    valueDateTime?:        FHIR_dateTime;

    valueCodeableConcept?: FHIR_CodeableConcept;
    valueString?:          FHIR_string;
    valueInteger?:         FHIR_integer;
}

export interface FHIR_Extension_A extends FHIR_Element_A {
    url: string;

    valueBase64Binary?:    FHIR_base64Binary_A;
    valueBoolean?:         FHIR_boolean_A;
    valueCanonical?:       FHIR_canonical_A;
    valueCode?:            FHIR_code_A;
    valueDate?:            FHIR_date_A;
    valueDateTime?:        FHIR_dateTime_A;

    valueCodeableConcept?: FHIR_CodeableConcept_A;
    valueString?:          FHIR_string_A;
    valueInteger?:         FHIR_integer_A;
}


export const FHIR_Element_T: t.Type<FHIR_Element_A, FHIR_Element> = t.recursion("FHIR_Element", () =>
    t.partial({
        id:        FHIR_string_T,
        extension: t.array(FHIR_Extension_T)
    })
);

export const FHIR_Coding_T = t.partial({
    system:       FHIR_uri_T,
    version:      FHIR_string_T,
    code:         FHIR_code_T,
    display:      FHIR_string_T,
    userSelected: FHIR_boolean_T
});



export type FHIR_Coding_A = t.TypeOf<  typeof FHIR_Coding_T>;
export type FHIR_Coding   = t.OutputOf<typeof FHIR_Coding_T>;

export const Array_FHIR_Coding_T = t.array(FHIR_Coding_T);


// eslint-disable-next-line max-len
export class FHIR_CodeableConcept_TC extends t.Type<{ coding?: FHIR_Coding_A[], text?: FHIR_string_A }, { coding?: FHIR_Coding[], text?: FHIR_string }, unknown> {
    constructor () {
        super(
            "FHIR_CodeableConcept_TC",

            // is
            (x): x is { coding?: FHIR_Coding_A[], text?: FHIR_string_A } => E.isRight(this.decode(x)),

            // decode
            (x, c) => {
                if (x?.constructor?.name === "Object") {
                    if ((typeof (x as any).coding === "undefined") && (typeof (x as any).text === "undefined")) {
                        return t.failure(x, c, "both 'coding' and 'text' are missing");
                    }

                    const result: any = {};

                    if (typeof (x as any).coding !== "undefined") {
                        const coding = t.array(FHIR_Coding_T).decode((x as any).coding);
                        if (E.isLeft(coding)) {
                            return coding;
                        }

                        result.coding = coding.right;
                    }

                    if (typeof (x as any).text !== "undefined") {
                        const text = FHIR_string_T.decode((x as any).text);
                        if (E.isLeft(text)) {
                            return text;
                        }
                        result.text = text.right;
                    }

                    return t.success(result);

                } else {
                    return t.failure(x, c, "value is not an object");
                }
            },

            // encode
            (obj: { coding?: FHIR_Coding_A[], text?: FHIR_string_A }) => {
                const result: any = {};
                if (typeof obj.coding !== "undefined") {
                    result.coding = obj.coding;
                }
                if (typeof obj.text !== "undefined") {
                    result.text = obj.text;
                }
                return result;
            }
        );
    }
}

export const FHIR_CodeableConcept_T = new FHIR_CodeableConcept_TC();
export type  FHIR_CodeableConcept_A = t.TypeOf<  typeof FHIR_CodeableConcept_T>;
export type  FHIR_CodeableConcept   = t.OutputOf<typeof FHIR_CodeableConcept_T>;



export const AnnotatedCodeableConcept_T = t.intersection([
    t.type({
        codeableConcept: FHIR_CodeableConcept_T
    }),
    t.partial({
        resolvedText: t.string
    })
]);
export type AnnotatedCodeableConcept_A = t.TypeOf<  typeof AnnotatedCodeableConcept_T>;
export type AnnotatedCodeableConcept   = t.OutputOf<typeof AnnotatedCodeableConcept_T>;




export const FHIR_Extension_value_internal_T = t.union([
    t.type({ _valueTag: t.literal("none") }),

    t.type({ _valueTag: t.literal("valueBase64Binary"),    valueBase64Binary:    FHIR_base64Binary_T    }, "valueBase64Binary"    ),
    t.type({ _valueTag: t.literal("valueBoolean"),         valueBoolean:         FHIR_boolean_T         }, "valueBoolean"         ),
    t.type({ _valueTag: t.literal("valueCanonical"),       valueCanonical:       FHIR_canonical_T       }, "valueCanonical"       ),
    t.type({ _valueTag: t.literal("valueCode"),            valueCode:            FHIR_code_T            }, "valueCode"            ),
    t.type({ _valueTag: t.literal("valueDate"),            valueDate:            FHIR_date_T            }, "valueDate"            ),
    t.type({ _valueTag: t.literal("valueDateTime"),        valueDateTime:        FHIR_dateTime_T        }, "valueDateTime"        ),



    t.type({ _valueTag: t.literal("valueCodeableConcept"), valueCodeableConcept: FHIR_CodeableConcept_T }, "valueCodeableConcept" ),
    t.type({ _valueTag: t.literal("valueString"),          valueString:          FHIR_string_T          }, "valueString"          ),
    t.type({ _valueTag: t.literal("valueInteger"),         valueInteger:         FHIR_integer_T         }, "valueInteger"         )
]);

export type FHIR_Extension_value_internal_A = t.TypeOf<  typeof FHIR_Extension_value_internal_T>;
export type FHIR_Extension_value_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_Extension_value_internal_T>, "_valueTag">;

export const FHIR_Extension_value_T = makeTaggedUnionTypeClass<FHIR_Extension_value_internal_A,
                                                                     FHIR_Extension_value_internal,
                                                                     typeof FHIR_Extension_value_internal_T>(
    FHIR_Extension_value_internal_T,
    "FHIR_Extension_value_internal_T",
    "_valueTag"
);

export const FHIR_Extension_T: t.Type<FHIR_Extension_A, FHIR_Extension> = t.recursion("FHIR_Extension_T", () =>
    t.intersection([
        FHIR_Element_T,
        FHIR_Extension_value_T,
        t.type({
            url: FHIR_uri_T
        })
    ])
);


export const FHIR_BackboneElement_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        modifierExtension: t.array(FHIR_Extension_T)
    })
]);

export type FHIR_BackboneElement_A = t.TypeOf<  typeof FHIR_BackboneElement_T>;
export type FHIR_BackboneElement   = t.OutputOf<typeof FHIR_BackboneElement_T>;



export const FHIR_Quantity_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        value:  FHIR_decimal_T,
        comparator: t.keyof({
            "<":  null,
            "<=": null,
            ">=": null,
            ">":  null
        }),
        unit:   FHIR_string_T,
        system: FHIR_uri_T,
        code:   FHIR_code_T
    })
]);

export type FHIR_Quantity_A = t.TypeOf<  typeof FHIR_Quantity_T>;
export type FHIR_Quantity   = t.OutputOf<typeof FHIR_Quantity_T>;

export const FHIR_Duration_T = FHIR_Quantity_T;


export const FHIR_SimpleQuantity_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        value:  FHIR_decimal_T,
        unit:   FHIR_string_T,
        system: FHIR_uri_T,
        code:   FHIR_code_T
    })
]);

export type FHIR_SimpleQuantity_A = t.TypeOf<  typeof FHIR_SimpleQuantity_T>;
export type FHIR_SimpleQuantity   = t.OutputOf<typeof FHIR_SimpleQuantity_T>;


export const FHIR_Period_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        start: FHIR_dateTime_T,
        end:   FHIR_dateTime_T
    })
]);

export type FHIR_Period_A = t.TypeOf<typeof FHIR_Period_T>;
export type FHIR_Period   = t.OutputOf<typeof FHIR_Period_T>;


export const FHIR_Identifier_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        use: t.keyof({
            "usual":     null,
            "official":  null,
            "temp":      null,
            "secondary": null,
            "old":       null
        }),
        type:     FHIR_CodeableConcept_T,
        system:   FHIR_uri_T,
        value:    FHIR_string_T,
        period:   FHIR_Period_T

        // Keep assigner out as it introduces a cyclic dependency.
        // Tackle it when needed.
        // assigner: FHIR_Reference_T
    })
]);


export type FHIR_Identifier_A = t.TypeOf<  typeof FHIR_Identifier_T>;
export type FHIR_Identifier   = t.OutputOf<typeof FHIR_Identifier_T>;

export const Array_FHIR_Identifier_T = t.array(FHIR_Identifier_T);
export const Array_Array_FHIR_Identifier_T = t.array(Array_FHIR_Identifier_T);

export const eqIdentifier: Eq<FHIR_Identifier_A> = {
    equals: (x, y) => x.system === y.system && x.value === y.value
};




export const FHIR_HumanName_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        use: t.keyof({
            "usual":     null,
            "official":  null,
            "temp":      null,
            "nickname":  null,
            "anonymous": null,
            "old":       null,
            "maiden":    null
        }),
        text:   FHIR_string_T,
        family: FHIR_string_T,
        given:  t.array(FHIR_string_T),
        prefix: t.array(FHIR_string_T),
        suffix: t.array(FHIR_string_T),
        period: FHIR_Period_T
    })
]);

export type FHIR_HumanName_A = t.TypeOf<  typeof FHIR_HumanName_T>;
export type FHIR_HumanName   = t.OutputOf<typeof FHIR_HumanName_T>;




export const FHIR_ContactPoint_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        system: t.keyof({
            "phone": null,
            "fax":   null,
            "email": null,
            "pager": null,
            "url":   null,
            "sms":   null,
            "other": null
        }),
        value: FHIR_string_T,
        use:   t.keyof({
            "home":   null,
            "work":   null,
            "temp":   null,
            "old":    null,
            "mobile": null
        }),
        rank:   FHIR_positiveInt_T,
        period: FHIR_Period_T
    })
]);

export type FHIR_ContactPoint = t.TypeOf<typeof FHIR_ContactPoint_T>;




export const FHIR_Range_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        low:  FHIR_Quantity_T,
        high: FHIR_Quantity_T
    })
]);




export const FHIR_Ratio_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        numerator:   FHIR_Quantity_T,
        denominator: FHIR_Quantity_T
    })
]);

export type FHIR_Ratio_A = t.TypeOf<  typeof FHIR_Ratio_T>;
export type FHIR_Ratio   = t.OutputOf<typeof FHIR_Ratio_T>;



export const FHIR_Address_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        use: t.keyof({
            "home":    null,
            "work":    null,
            "temp":    null,
            "old":     null,
            "billing": null
        }),
        type: t.keyof({
            "postal":   null,
            "physical": null,
            "both":     null
        }),
        text:       FHIR_string_T,
        line:       t.array(FHIR_string_T),
        city:       FHIR_string_T,
        district:   FHIR_string_T,
        state:      FHIR_string_T,
        postalCode: FHIR_string_T,
        country:    FHIR_string_T,
        period:     FHIR_Period_T
    })
]);

export type FHIR_Address_A = t.TypeOf<  typeof FHIR_Address_T>;
export type FHIR_Address   = t.OutputOf<typeof FHIR_Address_T>;






export const FHIR_Reference_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        reference:  FHIR_string_T,
        type:       FHIR_uri_T,
        identifier: FHIR_Identifier_T,
        display:    FHIR_string_T
    })
]);

export type FHIR_Reference_A = t.TypeOf<typeof FHIR_Reference_T>;
export type FHIR_Reference   = t.OutputOf<typeof FHIR_Reference_T>;




export const FHIR_Annotation_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        authorString:    FHIR_string_T,
        authorReference: FHIR_Reference_T,

        time:            FHIR_dateTime_T,
        text:            FHIR_markdown_T
    })
]);

export type FHIR_Annotation_A = t.TypeOf<typeof FHIR_Annotation_T>;
export type FHIR_Annotation   = t.OutputOf<typeof FHIR_Annotation_T>;



export const FHIR_Money_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        value:    FHIR_decimal_T,
        currency: FHIR_code_T
    })
]);

export type FHIR_Money_A = t.TypeOf<typeof FHIR_Money_T>;
export type FHIR_Money   = t.OutputOf<typeof FHIR_Money_T>;



export const FHIR_SampledData_T = t.intersection([
    FHIR_Element_T,
    t.type({
        origin:     FHIR_SimpleQuantity_T,
        period:     FHIR_decimal_T,
        dimensions: FHIR_positiveInt_T
    }),
    t.partial({
        factor:     FHIR_decimal_T,
        lowerLimit: FHIR_decimal_T,
        upperLimit: FHIR_decimal_T,
        data:       FHIR_string_T
    })
]);

export type FHIR_SampledData_A = t.TypeOf<typeof FHIR_SampledData_T>;
export type FHIR_SampledData   = t.OutputOf<typeof FHIR_SampledData_T>;




export const FHIR_Timing_Repeat_Bounds_internal_T = t.union([
    t.type({ _boundsTag: t.literal("none") }),

    t.type({ _boundsTag: t.literal("boundsDuration"), boundsDuration: FHIR_Duration_T }, "boundsDuration"),
    t.type({ _boundsTag: t.literal("boundsRange"),    boundsRange:    FHIR_Range_T    }, "boundsRange"   ),
    t.type({ _boundsTag: t.literal("boundsPeriod"),   boundsPeriod:   FHIR_Period_T   }, "boundsPeriod"  )
]);

export type FHIR_Timing_Repeat_Bounds_internal = t.TypeOf<typeof FHIR_Timing_Repeat_Bounds_internal_T>;

export type FHIR_Timing_Repeat_Bounds = DistributiveOmit<FHIR_Timing_Repeat_Bounds_internal, "_boundsTag">;

export const FHIR_Timing_Repeat_Bounds_T = makeTaggedUnionTypeClass<
    FHIR_Timing_Repeat_Bounds_internal,
    FHIR_Timing_Repeat_Bounds,
    typeof FHIR_Timing_Repeat_Bounds_internal_T>(
    FHIR_Timing_Repeat_Bounds_internal_T, "FHIR_Timing_Repeat_Bounds_internal_T", "_boundsTag"
);



export const FHIR_Timing_Repeat_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        count:        FHIR_positiveInt_T,
        countMax:     FHIR_positiveInt_T,

        duration:     FHIR_decimal_T,
        durationMax:  FHIR_decimal_T,
        durationUnit: t.keyof({ s: null, min: null, h: null, d: null, wk: null, mo: null, a: null }),

        frequency:    FHIR_positiveInt_T,
        frequencyMax: FHIR_positiveInt_T,

        period:       FHIR_decimal_T,
        periodMax:    FHIR_decimal_T,
        periodUnit:   t.keyof({ s: null, min: null, h: null, d: null, wk: null, mo: null, a: null }),

        dayOfWeek:    t.array(t.keyof({ mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null })),
        timeOfDay:    t.array(FHIR_time_T),

        when:         t.array(FHIR_code_T),
        offset:       FHIR_unsignedInt_T
    }),

    FHIR_Timing_Repeat_Bounds_T
]);

export type FHIR_Timing_Repeat_A = t.TypeOf<  typeof FHIR_Timing_Repeat_T>;
export type FHIR_Timing_Repeat   = t.OutputOf<typeof FHIR_Timing_Repeat_T>;


export const FHIR_Timing_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        event:  t.array(FHIR_dateTime_T),
        repeat: FHIR_Timing_Repeat_T,
        code:   FHIR_CodeableConcept_T
    })
]);

export type FHIR_Timing_A = t.TypeOf<  typeof FHIR_Timing_T>;
export type FHIR_Timing   = t.OutputOf<typeof FHIR_Timing_T>;



export const FHIR_Attachment_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        contentType: FHIR_code_T,
        language:    FHIR_code_T,
        data:        FHIR_base64Binary_T,
        url:         FHIR_url_T,
        size:        FHIR_unsignedInt_T,
        hash:        FHIR_base64Binary_T,
        title:       FHIR_string_T,
        creation:    FHIR_dateTime_T,

        // SDK deviation
        file:        t.unknown
    })
]);

export type FHIR_Attachment_A = t.TypeOf<  typeof FHIR_Attachment_T>;
export type FHIR_Attachment   = t.OutputOf<typeof FHIR_Attachment_T>;


export const FHIR_Meta_T = t.intersection([
    FHIR_Element_T,
    t.partial({
        versionId:   FHIR_id_T,
        lastUpdated: FHIR_instant_T,
        source:      FHIR_uri_T,
        profile:     t.array(FHIR_canonical_T),
        security:    t.array(FHIR_Coding_T),
        tag:         t.array(FHIR_Coding_T)
    })
]);

export type FHIR_Meta_A = t.TypeOf<  typeof FHIR_Meta_T>;
export type FHIR_Meta   = t.OutputOf<typeof FHIR_Meta_T>;


export const FHIR_Resource_T = t.intersection([
    t.type({
        resourceType:  FHIR_code_T
    }),
    t.partial({
        id:            FHIR_id_T,
        meta:          FHIR_Meta_T,
        implicitRules: FHIR_uri_T,
        language:      FHIR_code_T,

        __phdpCreated: FHIR_instant_T,
        __phdpUpdated: FHIR_instant_T
    })
]);

export type FHIR_Resource_A = t.TypeOf<  typeof FHIR_Resource_T>;
export type FHIR_Resource   = t.OutputOf<typeof FHIR_Resource_T>;


export const FHIR_Narrative_T = t.intersection([
    FHIR_Element_T,
    t.type({
        status: t.keyof({
            "generated":  null,
            "extensions": null,
            "additional": null,
            "empty":      null
        }),
        div: FHIR_xhtml_T

    })
]);
export type FHIR_Narrative_A = t.TypeOf<  typeof FHIR_Narrative_T>;
export type FHIR_Narrative   = t.OutputOf<typeof FHIR_Narrative_T>;


export const FHIR_DomainResource_T = t.intersection([
    FHIR_Resource_T,
    t.partial({
        text:              FHIR_Narrative_T,
        contained:         t.array(FHIR_Resource_T),
        extension:         t.array(FHIR_Extension_T),
        modifierExtension: t.array(FHIR_Extension_T)
    })
]);

export type FHIR_DomainResource_A = t.TypeOf<  typeof FHIR_DomainResource_T>;
export type FHIR_DomainResource   = t.OutputOf<typeof FHIR_DomainResource_T>;



export const FHIR_Dosage_doseAndRate_dose_internal_T = t.union([
    t.type({ _doseTag: t.literal("none") }),

    t.type({ _doseTag: t.literal("doseRange"),    doseRange:    FHIR_Range_T          }, "doseRange"    ),
    t.type({ _doseTag: t.literal("doseQuantity"), doseQuantity: FHIR_SimpleQuantity_T }, "doseQuantity" )
]);

export type FHIR_Dosage_doseAndRate_dose_internal = t.TypeOf<typeof FHIR_Dosage_doseAndRate_dose_internal_T>;

export type FHIR_Dosage_doseAndRate_dose = DistributiveOmit<FHIR_Dosage_doseAndRate_dose_internal, "_doseTag">;

export const FHIR_Dosage_doseAndRate_dose_T = makeTaggedUnionTypeClass<
    FHIR_Dosage_doseAndRate_dose_internal,
    FHIR_Dosage_doseAndRate_dose,
    typeof FHIR_Dosage_doseAndRate_dose_internal_T>(
    FHIR_Dosage_doseAndRate_dose_internal_T, "FHIR_Dosage_doseAndRate_dose_internal_T", "_doseTag"
);


export const FHIR_Dosage_doseAndRate_rate_internal_T = t.union([
    t.type({ _rateTag: t.literal("none") }),

    t.type({ _rateTag: t.literal("rateRatio"),    rateRatio:    FHIR_Ratio_T          }, "rateRatio"    ),
    t.type({ _rateTag: t.literal("rateRange"),    rateRange:    FHIR_Range_T          }, "rateRange"    ),
    t.type({ _rateTag: t.literal("rateQuantity"), rateQuantity: FHIR_SimpleQuantity_T }, "rateQuantity" )
]);

export type FHIR_Dosage_doseAndRate_rate_internal = t.TypeOf<typeof FHIR_Dosage_doseAndRate_rate_internal_T>;

export type FHIR_Dosage_doseAndRate_rate = DistributiveOmit<FHIR_Dosage_doseAndRate_rate_internal, "_rateTag">;

export const FHIR_Dosage_doseAndRate_rate_T = makeTaggedUnionTypeClass<
    FHIR_Dosage_doseAndRate_rate_internal,
    FHIR_Dosage_doseAndRate_rate,
    typeof FHIR_Dosage_doseAndRate_rate_internal_T>(
    FHIR_Dosage_doseAndRate_rate_internal_T, "FHIR_Dosage_doseAndRate_rate_internal_T", "_rateTag"
);


export const FHIR_Dosage_doseAndRate_T = t.intersection([
    FHIR_Element_T,

    FHIR_Dosage_doseAndRate_dose_T,
    FHIR_Dosage_doseAndRate_rate_T,

    t.partial({
        type: FHIR_CodeableConcept_T
    })
]);

export type FHIR_Dosage_doseAndRate_A = t.TypeOf<  typeof FHIR_Dosage_doseAndRate_T>;
export type FHIR_Dosage_doseAndRate   = t.OutputOf<typeof FHIR_Dosage_doseAndRate_T>;


export const FHIR_Dosage_asNeeded_internal_T = t.union([
    t.type({ _asNeededTag: t.literal("none") }),

    t.type({ _asNeededTag: t.literal("doseBoolean"),         doseBoolean:         FHIR_boolean_T         }, "doseBoolean"         ),
    t.type({ _asNeededTag: t.literal("doseCodeableConcept"), doseCodeableConcept: FHIR_CodeableConcept_T }, "doseCodeableConcept" )
]);

export type FHIR_Dosage_asNeeded_internal = t.TypeOf<typeof FHIR_Dosage_asNeeded_internal_T>;

export type FHIR_Dosage_asNeeded = DistributiveOmit<FHIR_Dosage_asNeeded_internal, "_asNeededTag">;

export const FHIR_Dosage_asNeeded_T = makeTaggedUnionTypeClass<
    FHIR_Dosage_asNeeded_internal,
    FHIR_Dosage_asNeeded,
    typeof FHIR_Dosage_asNeeded_internal_T>(
    FHIR_Dosage_asNeeded_internal_T, "FHIR_Dosage_asNeeded_internal_T", "_asNeededTag"
);


export const FHIR_Dosage_T = t.intersection([
    FHIR_BackboneElement_T,

    FHIR_Dosage_asNeeded_T,

    t.partial({
        sequence:                 FHIR_integer_T,
        text:                     FHIR_string_T,
        additionalInstruction:    t.array(FHIR_CodeableConcept_T),
        patientInstruction:       FHIR_string_T,
        timing:                   FHIR_Timing_T,
        site:                     FHIR_CodeableConcept_T,
        route:                    FHIR_CodeableConcept_T,
        method:                   FHIR_CodeableConcept_T,
        doseAndRate:              t.array(FHIR_Dosage_doseAndRate_T),
        maxDosePerPeriod:         FHIR_Ratio_T,
        maxDosePerAdministration: FHIR_SimpleQuantity_T,
        maxDosePerLifetime:       FHIR_SimpleQuantity_T
    })
]);

export type FHIR_Dosage_A = t.TypeOf<  typeof FHIR_Dosage_T>;
export type FHIR_Dosage   = t.OutputOf<typeof FHIR_Dosage_T>;


export const FHIR_Age_T = FHIR_Quantity_T;
export type FHIR_Age_A  = t.TypeOf<  typeof FHIR_Age_T>;
export type FHIR_Age    = t.OutputOf<typeof FHIR_Age_T>;


export const FHIR_Signature_T = t.intersection([
    FHIR_Element_T,
    t.type({
        type: t.array(FHIR_Coding_T),
        when: FHIR_instant_T,
        who:  FHIR_Reference_T
    }),
    t.partial({
        onBehalfOf:   FHIR_Reference_T,
        targetFormat: FHIR_code_T,
        sigFormat:    FHIR_code_T,
        data:         FHIR_base64Binary_T
    })
]);

export type FHIR_Signature_A = t.TypeOf<  typeof FHIR_Signature_T>;
export type FHIR_Signature   = t.OutputOf<typeof FHIR_Signature_T>;
