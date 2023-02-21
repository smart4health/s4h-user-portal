import * as t from "io-ts";
import * as O from "fp-ts/Option";

import { DistributiveOmit, makeTaggedUnionTypeClass } from "../../utils/fp-tools";

import { ConceptResolver } from "../types";
import { BoxedResource, Period } from "../base/boxed";
import { FHIR_boolean_T, FHIR_dateTime_T, FHIR_instant_T, FHIR_integer_T, FHIR_string_T, FHIR_time_T } from "../base/primitives";
import { FHIR_Annotation_T, FHIR_CodeableConcept_T, FHIR_DomainResource_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Quantity_T, FHIR_Range_T, FHIR_Ratio_T, FHIR_Reference_T, FHIR_SampledData_T, FHIR_SimpleQuantity_T, FHIR_Timing_T } from "../base/general-special-purpose";


export const FHIR_Observation_value_internal_T = t.union([
    t.type({ _valueTag: t.literal("none") }),

    t.type({ _valueTag: t.literal("valueQuantity"),        valueQuantity:        FHIR_Quantity_T        }, "valueQuantity"        ),
    t.type({ _valueTag: t.literal("valueCodeableConcept"), valueCodeableConcept: FHIR_CodeableConcept_T }, "valueCodeableConcept" ),
    t.type({ _valueTag: t.literal("valueString"),          valueString:          FHIR_string_T          }, "valueString"          ),
    t.type({ _valueTag: t.literal("valueBoolean"),         valueBoolean:         FHIR_boolean_T         }, "valueBoolean"         ),
    t.type({ _valueTag: t.literal("valueInteger"),         valueInteger:         FHIR_integer_T         }, "valueInteger"         ),
    t.type({ _valueTag: t.literal("valueRange"),           valueRange:           FHIR_Range_T           }, "valueRange"           ),
    t.type({ _valueTag: t.literal("valueRatio"),           valueRatio:           FHIR_Ratio_T           }, "valueRatio"           ),
    t.type({ _valueTag: t.literal("valueSampledData"),     valueSampledData:     FHIR_SampledData_T     }, "valueSampledData"     ),
    t.type({ _valueTag: t.literal("valueTime"),            valueTime:            FHIR_time_T            }, "valueTime"            ),
    t.type({ _valueTag: t.literal("valueDateTime"),        valueDateTime:        FHIR_dateTime_T        }, "valueDateTime"        ),
    t.type({ _valueTag: t.literal("valuePeriod"),          valuePeriod:          FHIR_Period_T          }, "valuePeriod"          )
]);

export type FHIR_Observation_value_internal_A = t.TypeOf<typeof FHIR_Observation_value_internal_T>;
export type FHIR_Observation_value_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_Observation_value_internal_T>, "_valueTag">;

export const FHIR_Observation_value_T = makeTaggedUnionTypeClass<FHIR_Observation_value_internal_A,
                                                                 FHIR_Observation_value_internal,
                                                                 typeof FHIR_Observation_value_internal_T>(
    FHIR_Observation_value_internal_T,
    "FHIR_Observation_value_internal_T",
    "_valueTag"
);


export const FHIR_Observation_effective_internal_T = t.union([

    t.type({ _effectiveTag: t.literal("none") }),
    t.type({ _effectiveTag: t.literal("effectiveDateTime"), effectiveDateTime: FHIR_dateTime_T  }, "effectiveDateTime"),
    t.type({ _effectiveTag: t.literal("effectivePeriod"),   effectivePeriod:   FHIR_Period_T    }, "effectivePeriod"  ),
    t.type({ _effectiveTag: t.literal("effectiveTiming"),   effectiveTiming:   FHIR_Timing_T    }, "effectiveTiming"  ),
    t.type({ _effectiveTag: t.literal("effectiveInstant"),  effectiveInstant:  FHIR_instant_T   }, "effectiveInstant" )
]);

export type FHIR_Observation_effective_internal_A = t.TypeOf<  typeof FHIR_Observation_effective_internal_T>;
export type FHIR_Observation_effective_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_Observation_effective_internal_T>, "_effectiveTag">;

export const FHIR_Observation_effective_T = makeTaggedUnionTypeClass<FHIR_Observation_effective_internal_A,
                                                                     FHIR_Observation_effective_internal,
                                                                     typeof FHIR_Observation_effective_internal_T>(
    FHIR_Observation_effective_internal_T,
    "FHIR_Observation_effective_internal_T",
    "_effectiveTag"
);

export const FHIR_Observation_referenceRange_T = t.partial({
    low:       FHIR_SimpleQuantity_T,
    high:      FHIR_SimpleQuantity_T,
    type:      FHIR_CodeableConcept_T,
    appliesTo: t.array(FHIR_CodeableConcept_T),
    age:       FHIR_Range_T,
    text:      FHIR_string_T
});


export const FHIR_Observation_component_T = t.intersection([
    t.type({
        code:  FHIR_CodeableConcept_T
    }),
    FHIR_Observation_value_T,
    t.partial({
        dataAbsentReason: FHIR_CodeableConcept_T,
        interpretation:   t.array(FHIR_CodeableConcept_T),
        referenceRange:   t.array(FHIR_Observation_referenceRange_T)
    })
]);


export const Internal_FHIR_Observation_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Observation"),
        subject:      FHIR_Reference_T,
        status: t.keyof({
            "registered":  null,
            "preliminary": null,
            "final":       null,
            "amended":     null
        })
    }),

    FHIR_Observation_effective_T,
    FHIR_Observation_value_T,

    t.partial({
        identifier:       t.array(FHIR_Identifier_T),
        basedOn:          t.array(FHIR_Reference_T),
        partOf:           t.array(FHIR_Reference_T),
        category:         t.array(FHIR_CodeableConcept_T),
        code:             FHIR_CodeableConcept_T,
        focus:            t.array(FHIR_Reference_T),
        encounter:        FHIR_Reference_T,
        issued:           FHIR_instant_T,
        performer:        t.array(FHIR_Reference_T),

        dataAbsentReason: FHIR_CodeableConcept_T,
        interpretation:   t.array(FHIR_CodeableConcept_T),
        note:             t.array(FHIR_Annotation_T),
        bodySite:         FHIR_CodeableConcept_T,
        method:           FHIR_CodeableConcept_T,
        specimen:         FHIR_Reference_T,
        device:           FHIR_Reference_T,
        referenceRange:   t.array(FHIR_Observation_referenceRange_T),
        hasMember:        t.array(FHIR_Reference_T),
        derivedFrom:      t.array(FHIR_Reference_T),
        component:        t.array(FHIR_Observation_component_T)
    })
]);

type Internal_FHIR_Observation_A = t.TypeOf<  typeof Internal_FHIR_Observation_T>;
type Internal_FHIR_Observation   = t.OutputOf<typeof Internal_FHIR_Observation_T>;

export const FHIR_Observation_T = new t.Type<Internal_FHIR_Observation_A, Internal_FHIR_Observation, unknown>(
    "FHIR_Observation_T",
    Internal_FHIR_Observation_T.is,
    Internal_FHIR_Observation_T.decode,

    (obj: Internal_FHIR_Observation_A) => {
        const enc = Internal_FHIR_Observation_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_effectiveTag"];
        delete enc["_valueTag"];
        return enc;
    }
);

export type FHIR_Observation_A = t.TypeOf<  typeof FHIR_Observation_T>;
export type FHIR_Observation   = t.OutputOf<typeof FHIR_Observation_T>;



export type BoxedObservation = BoxedResource<FHIR_Observation_A> & {
    code:                 O.Option<string>;
    valueCodeableConcept: O.Option<string>;
};

export function boxObservationResource (res: FHIR_Observation_A): BoxedObservation {
    return {
        boxed: res,
        ...getPeriodFromObservation(res),

        code:  O.none,
        valueCodeableConcept: O.none
    };
}

export function resolveObservationConceptTexts (resolver: ConceptResolver, res: BoxedObservation): void {
    if (res.boxed.code) {
        resolver(res.boxed.code).then(os => { res.code = os; });
    }

    if (res.boxed._valueTag === "valueCodeableConcept") {
        resolver(res.boxed.valueCodeableConcept).then(os => { res.valueCodeableConcept = os; });
    }
}

function getPeriodFromObservation (_res: FHIR_Observation_A): Period {
    // Change this when actual intervals are needed.
    return {
        period: {
            min: -Infinity,
            max: +Infinity
        }
    };
}
