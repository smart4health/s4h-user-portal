import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { DistributiveOmit, makeTaggedUnionTypeClass } from "../../utils/fp-tools";

import { ConceptResolver } from "../types";
import { Tau_valueOf_floor } from "../utils/tau";
import { BoxedResource, Period } from "../base/boxed";
import { FHIR_code_T, FHIR_dateTime_T, FHIR_string_T } from "../base/primitives";
import { AnnotatedCodeableConcept_A, FHIR_Age_T, FHIR_Annotation_T, FHIR_CodeableConcept_T, FHIR_DomainResource_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Range_T, FHIR_Reference_T } from "../base/general-special-purpose";


export const FHIR_AllergyIntolerance_onset_internal_T = t.union([
    t.type({ _onsetTag: t.literal("none") }),

    t.type({ _onsetTag: t.literal("onsetDateTime"), onsetDateTime: FHIR_dateTime_T }, "onsetDateTime" ),
    t.type({ _onsetTag: t.literal("onsetAge"),      onsetAge:      FHIR_Age_T      }, "onsetAge"      ),
    t.type({ _onsetTag: t.literal("onsetPeriod"),   onsetPeriod:   FHIR_Period_T   }, "onsetPeriod"   ),
    t.type({ _onsetTag: t.literal("onsetRange"),    onsetRange:    FHIR_Range_T    }, "onsetRange"    ),
    t.type({ _onsetTag: t.literal("onsetString"),   onsetString:   FHIR_string_T   }, "onsetString"   )
]);

export type FHIR_AllergyIntolerance_onset_internal_A = t.TypeOf<typeof FHIR_AllergyIntolerance_onset_internal_T>;
export type FHIR_AllergyIntolerance_onset_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_AllergyIntolerance_onset_internal_T>, "_onsetTag">;

export const FHIR_AllergyIntolerance_onset_T = makeTaggedUnionTypeClass<FHIR_AllergyIntolerance_onset_internal_A,
                                                                 FHIR_AllergyIntolerance_onset_internal,
                                                                 typeof FHIR_AllergyIntolerance_onset_internal_T>(
    FHIR_AllergyIntolerance_onset_internal_T,
    "FHIR_AllergyIntolerance_onset_internal_T",
    "_onsetTag"
);


export const FHIR_AllergyIntolerance_reaction_T = t.intersection([
    t.type({
        manifestation: t.array(FHIR_CodeableConcept_T) // cardinality: 1..*
    }),
    t.partial({
        substance:     FHIR_CodeableConcept_T,
        description:   FHIR_string_T,
        onset:         FHIR_dateTime_T,
        severity:      FHIR_code_T,
        exposureRoute: FHIR_CodeableConcept_T,
        note:          t.array(FHIR_Annotation_T)
    })
]);

export const Internal_FHIR_AllergyIntolerance_T = t.intersection([
    FHIR_DomainResource_T,

    t.type({
        resourceType:       t.literal("AllergyIntolerance"),
        patient:            FHIR_Reference_T
    }),

    FHIR_AllergyIntolerance_onset_T,

    t.partial({
        identifier:         t.array(FHIR_Identifier_T),
        clinicalStatus:     FHIR_CodeableConcept_T, // optional (in contrast to Condition.clinicalStatus)
        verificationStatus: FHIR_CodeableConcept_T,
        type:               FHIR_code_T,
        category:           t.array(FHIR_code_T),
        criticality:        FHIR_code_T,
        code:               FHIR_CodeableConcept_T,
        encounter:          FHIR_Reference_T,
        recordedDate:       FHIR_dateTime_T,
        recorder:           FHIR_Reference_T,
        asserter:           FHIR_Reference_T,
        lastOccurrence:     FHIR_dateTime_T,
        note:               t.array(FHIR_Annotation_T),

        reaction:           t.array(FHIR_AllergyIntolerance_reaction_T)
    })
]);

type Internal_FHIR_AllergyIntolerance_A = t.TypeOf<  typeof Internal_FHIR_AllergyIntolerance_T>;
type Internal_FHIR_AllergyIntolerance   = t.OutputOf<typeof Internal_FHIR_AllergyIntolerance_T>;

export const FHIR_AllergyIntolerance_T = new t.Type<Internal_FHIR_AllergyIntolerance_A, Internal_FHIR_AllergyIntolerance, unknown>(
    "FHIR_AllergyIntolerance_T",
    Internal_FHIR_AllergyIntolerance_T.is,
    Internal_FHIR_AllergyIntolerance_T.decode,

    (obj: Internal_FHIR_AllergyIntolerance_A) => {
        const enc = Internal_FHIR_AllergyIntolerance_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_onsetTag"];
        return enc;
    }
);

export type FHIR_AllergyIntolerance_A = t.TypeOf<  typeof FHIR_AllergyIntolerance_T>;
export type FHIR_AllergyIntolerance   = t.OutputOf<typeof FHIR_AllergyIntolerance_T>;


export type BoxedReaction = {
    substance:     O.Option<AnnotatedCodeableConcept_A>;
    manifestation: AnnotatedCodeableConcept_A[];
    exposureRoute: O.Option<AnnotatedCodeableConcept_A>;
};

export type BoxedAllergyIntolerance = BoxedResource<FHIR_AllergyIntolerance_A> & {
    code:               O.Option<AnnotatedCodeableConcept_A>;
    clinicalStatus:     O.Option<AnnotatedCodeableConcept_A>;
    verificationStatus: O.Option<AnnotatedCodeableConcept_A>;
    reaction:           BoxedReaction[];
    criticalityConcept: O.Option<AnnotatedCodeableConcept_A>;
};

export function boxAllergyIntoleranceResource (res: FHIR_AllergyIntolerance_A): BoxedAllergyIntolerance {
    return {
        boxed: res,
        ...getPeriodFromAllergyIntolerance(res),

        code:               O.none,
        reaction:           [],
        clinicalStatus:     O.none,
        verificationStatus: O.none,

        criticalityConcept: pipe(res.criticality, O.fromNullable, O.map(c => ({
            codeableConcept: {
                coding: [{
                    system: "http://hl7.org/fhir/allergy-intolerance-criticality",
                    code: c
                }]
            },
            resolvedText: undefined
        })))
    };
}


function getPeriodFromAllergyIntolerance (res: FHIR_AllergyIntolerance_A): Period {
    return {
        period: {
            min: pipe(res.recordedDate, O.fromNullable, O.map(Tau_valueOf_floor), O.getOrElse(() => -Infinity)),
            max: +Infinity
        }
    };
}

// eslint-disable-next-line complexity
export function resolveAllergyIntoleranceConceptTexts (resolver: ConceptResolver, res: BoxedAllergyIntolerance): void {
    if (res.boxed.code) {
        resolver(res.boxed.code).then(text => {
            res.code = O.some({
                codeableConcept: res.boxed.code,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(text)
            });
        });
    }

    if (res.boxed.clinicalStatus) {
        resolver(res.boxed.clinicalStatus).then(text => {
            res.clinicalStatus = O.some({
                codeableConcept: res.boxed.clinicalStatus,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(text)
            });
        });
    }

    if (res.boxed.verificationStatus) {
        resolver(res.boxed.verificationStatus).then(text => {
            res.verificationStatus = O.some({
                codeableConcept: res.boxed.verificationStatus,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(text)
            });
        });
    }

    if (O.isSome(res.criticalityConcept)) {
        resolver(res.criticalityConcept.value.codeableConcept).then(text => {
            res.criticalityConcept = O.some({
                codeableConcept: (res.criticalityConcept as O.Some<AnnotatedCodeableConcept_A>).value.codeableConcept,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(text)
            });
        });
    }

    if (res.boxed.reaction) {
        for (const reaction of res.boxed.reaction) {
            const r: BoxedReaction = {
                substance: O.none,
                manifestation: [],
                exposureRoute: O.none
            };
            res.reaction.push(r);

            if (reaction.substance) {
                resolver(reaction.substance).then(text => {
                    r.substance = O.some({
                        codeableConcept: reaction.substance,
                        // eslint-disable-next-line max-nested-callbacks
                        resolvedText: O.getOrElse(() => undefined)(text)
                    });
                });
            }

            if (reaction.exposureRoute) {
                resolver(reaction.exposureRoute).then(text => {
                    r.exposureRoute = O.some({
                        codeableConcept: reaction.exposureRoute,
                        // eslint-disable-next-line max-nested-callbacks
                        resolvedText: O.getOrElse(() => undefined)(text)
                    });
                });
            }

            if (reaction.manifestation) {
                Promise.all(A.map(resolver)(reaction.manifestation))
                    .then(texts => {
                        for (let i = 0; i < texts.length; i++) {
                            const text = texts[i];
                            if (O.isSome(text)) {
                                r.manifestation.push({
                                    codeableConcept: reaction.manifestation[i],
                                    resolvedText:    text.value
                                });
                            } else {
                                r.manifestation.push({
                                    codeableConcept: reaction.manifestation[i]
                                });
                            }
                        }
                });
            }
        }
    }
}
