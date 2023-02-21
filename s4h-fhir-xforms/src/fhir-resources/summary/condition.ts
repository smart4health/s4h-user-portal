import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { DistributiveOmit, makeTaggedUnionTypeClass } from "../../utils/fp-tools";

import { ConceptResolver } from "../types";
import { Tau_valueOf_floor } from "../utils/tau";
import { BoxedResource, Period } from "../base/boxed";
import { FHIR_dateTime_T, FHIR_string_T } from "../base/primitives";
import { AnnotatedCodeableConcept_A, FHIR_Age_T, FHIR_Annotation_T, FHIR_CodeableConcept_T, FHIR_DomainResource_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Range_T, FHIR_Reference_T } from "../base/general-special-purpose";


export const FHIR_Condition_onset_internal_T = t.union([
    t.type({ _onsetTag: t.literal("none") }),

    t.type({ _onsetTag: t.literal("onsetDateTime"), onsetDateTime: FHIR_dateTime_T }, "onsetDateTime" ),
    t.type({ _onsetTag: t.literal("onsetAge"),      onsetAge:      FHIR_Age_T      }, "onsetAge"      ),
    t.type({ _onsetTag: t.literal("onsetPeriod"),   onsetPeriod:   FHIR_Period_T   }, "onsetPeriod"   ),
    t.type({ _onsetTag: t.literal("onsetRange"),    onsetRange:    FHIR_Range_T    }, "onsetRange"    ),
    t.type({ _onsetTag: t.literal("onsetString"),   onsetString:   FHIR_string_T   }, "onsetString"   )
]);

export type FHIR_Condition_onset_internal_A = t.TypeOf<typeof FHIR_Condition_onset_internal_T>;
export type FHIR_Condition_onset_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_Condition_onset_internal_T>, "_onsetTag">;

export const FHIR_Condition_onset_T = makeTaggedUnionTypeClass<FHIR_Condition_onset_internal_A,
                                                                 FHIR_Condition_onset_internal,
                                                                 typeof FHIR_Condition_onset_internal_T>(
    FHIR_Condition_onset_internal_T,
    "FHIR_Condition_onset_internal_T",
    "_onsetTag"
);


// Structurally identical to 'onset' above, but we need to duplicate it, because it is a type of its own.
export const FHIR_Condition_abatement_internal_T = t.union([
    t.type({ _abatementTag: t.literal("none") }),

    t.type({ _abatementTag: t.literal("abatementDateTime"), abatementDateTime: FHIR_dateTime_T }, "abatementDateTime" ),
    t.type({ _abatementTag: t.literal("abatementAge"),      abatementAge:      FHIR_Age_T      }, "abatementAge"      ),
    t.type({ _abatementTag: t.literal("abatementPeriod"),   abatementPeriod:   FHIR_Period_T   }, "abatementPeriod"   ),
    t.type({ _abatementTag: t.literal("abatementRange"),    abatementRange:    FHIR_Range_T    }, "abatementRange"    ),
    t.type({ _abatementTag: t.literal("abatementString"),   abatementString:   FHIR_string_T   }, "abatementString"   )
]);

export type FHIR_Condition_abatement_internal_A = t.TypeOf<typeof FHIR_Condition_abatement_internal_T>;
export type FHIR_Condition_abatement_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_Condition_abatement_internal_T>, "_abatementTag">;

export const FHIR_Condition_abatement_T = makeTaggedUnionTypeClass<FHIR_Condition_abatement_internal_A,
                                                                 FHIR_Condition_abatement_internal,
                                                                 typeof FHIR_Condition_abatement_internal_T>(
    FHIR_Condition_abatement_internal_T,
    "FHIR_Condition_abatement_internal_T",
    "_abatementTag"
);


export const FHIR_Condition_stage_T = t.partial({
    summary:    FHIR_CodeableConcept_T,
    assessment: t.array(FHIR_Reference_T),
    type:       FHIR_CodeableConcept_T
});


export const FHIR_Condition_evidence_T = t.partial({
    code:   t.array(FHIR_CodeableConcept_T),
    detail: t.array(FHIR_Reference_T)
});


export const Internal_FHIR_Condition_T = t.intersection([
    FHIR_DomainResource_T,

    t.type({
        resourceType:       t.literal("Condition"),
        subject:            FHIR_Reference_T,
        clinicalStatus:     FHIR_CodeableConcept_T
    }),

    FHIR_Condition_onset_T,
    FHIR_Condition_abatement_T,

    t.partial({
        verificationStatus: FHIR_CodeableConcept_T,
        identifier:         t.array(FHIR_Identifier_T),
        category:           t.array(FHIR_CodeableConcept_T),
        severity:           FHIR_CodeableConcept_T,
        code:               FHIR_CodeableConcept_T,
        bodySite:           t.array(FHIR_CodeableConcept_T),
        encounter:          FHIR_Reference_T,
        recordedDate:       FHIR_dateTime_T,
        recorder:           FHIR_Reference_T,
        asserter:           FHIR_Reference_T,
        stage:              t.array(FHIR_Condition_stage_T),
        evidence:           t.array(FHIR_Condition_evidence_T),

        note:               t.array(FHIR_Annotation_T)
    })
]);

type Internal_FHIR_Condition_A = t.TypeOf<  typeof Internal_FHIR_Condition_T>;
type Internal_FHIR_Condition   = t.OutputOf<typeof Internal_FHIR_Condition_T>;

export const FHIR_Condition_T = new t.Type<Internal_FHIR_Condition_A, Internal_FHIR_Condition, unknown>(
    "FHIR_Condition_T",
    Internal_FHIR_Condition_T.is,
    Internal_FHIR_Condition_T.decode,

    (obj: Internal_FHIR_Condition_A) => {
        const enc = Internal_FHIR_Condition_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_onsetTag"];
        delete enc["_abatementTag"];
        return enc;
    }
);

export type FHIR_Condition_A = t.TypeOf<  typeof FHIR_Condition_T>;
export type FHIR_Condition   = t.OutputOf<typeof FHIR_Condition_T>;


export type BoxedCondition = BoxedResource<FHIR_Condition_A> & {
    severity:           O.Option<AnnotatedCodeableConcept_A>;
    code:               O.Option<AnnotatedCodeableConcept_A>;
    category:           O.Option<AnnotatedCodeableConcept_A>[];
    clinicalStatus:     AnnotatedCodeableConcept_A;
    verificationStatus: O.Option<AnnotatedCodeableConcept_A>;
};


export function boxConditionResource (res: FHIR_Condition_A): BoxedCondition {
    return {
        boxed: res,
        ...getPeriodFromCondition(res),

        severity:           O.none,
        code:               O.none,
        category:           [],
        clinicalStatus:     { codeableConcept: res.clinicalStatus },
        verificationStatus: O.none
    };
}


function getPeriodFromCondition (res: FHIR_Condition_A): Period {
    return {
        period: {
            min: pipe(res.recordedDate, O.fromNullable, O.map(Tau_valueOf_floor), O.getOrElse(() => -Infinity)),
            max: +Infinity
        }
    };
}

export function resolveConditionConceptTexts (resolver: ConceptResolver, res: BoxedCondition): void {
    if (res.boxed.severity) {
        resolver(res.boxed.severity).then(text => {
            res.severity = O.some({
                codeableConcept: res.boxed.severity,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(text)
            });
        });
    }

    if (res.boxed.code) {
        resolver(res.boxed.code).then(text => {
            res.code = O.some({
                codeableConcept: res.boxed.code,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(text)
            });
        });
    }

    if (res.boxed.clinicalStatus) { // is mandatory, but let's play safe
        resolver(res.boxed.clinicalStatus).then(text => {
            res.clinicalStatus = {
                codeableConcept: res.boxed.clinicalStatus,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(text)
            };
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

    if (res.boxed.category) {
        Promise.all(A.map(resolver)(res.boxed.category))
            .then(texts => {
                for (let i = 0; i < texts.length; i++) {
                    const text = texts[i];
                    if (O.isSome(text)) {
                        res.category.push(O.some({
                            codeableConcept: res.boxed.category[i],
                            resolvedText:    text.value
                        }));
                    } else {
                        res.category.push(O.some({
                            codeableConcept: res.boxed.category[i],
                            resolvedText: undefined
                        }));
                    }
                }
        });
    }

}
