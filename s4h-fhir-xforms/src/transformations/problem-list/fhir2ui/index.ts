import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Eq as eqString } from "fp-ts/string";
import { Ordering, sign } from "fp-ts/Ordering";
import { Eq as eqNumber, Ord as ordNumber } from "fp-ts/number";
import { Ord, contramap, fromCompare, reverse } from "fp-ts/Ord";

import { EitherIssueResult } from "../../../utils/fp-tools";
import { IssueList_A, info, msg } from "../../../utils/issues";
import { Tau_valueOf_floor } from "../../../fhir-resources/utils/tau";

import { AnnotatedCodeableConcept_A, FHIR_code_A } from "../../../fhir-resources/types";
import { BoxedCondition, FHIR_Condition_T, boxConditionResource } from "../../../fhir-resources/summary/condition";
import { makeDefaultCodeSystemsList, pickFirstMerger, resolveCodeableConceptTexts } from "../../../resolve-codings/concept-resolution";
import { BoxedAllergyIntolerance, FHIR_AllergyIntolerance_T, boxAllergyIntoleranceResource } from "../../../fhir-resources/summary/allergy-intolerance";

import { ModelReaderOptions } from "../../syncer";
import { getResources } from "../../syncer/resource-pool";

import { AllergyIntoleranceListResult_A, AllergyIntolerance_A, ProblemListResult_A, Problem_A } from "../defs";


const ordNumberInfinityRev: Ord<number> = {
    equals: (x: number, y: number) => {
        return eqNumber.equals(x, y);
    },

    compare: (x: number, y: number) => {
        if ((Math.abs(x) !== Infinity) && (Math.abs(y) !== Infinity)) {
            return ordNumber.compare(x, y);
        } else {
            return -ordNumber.compare(x, y) as Ordering;
        }
    }
};

export function readProblemList (options: ModelReaderOptions): T.Task<EitherIssueResult<ProblemListResult_A>> {
    return async () => {
        let issues: IssueList_A = [];

        const resources = await getResources({ sdk: options.sdk, resourceTypes: [ "Condition" ] })();
        if (E.isLeft(resources)) {
            return resources;
        }

        if (resources.right[1].length === 0) {
            issues = [ ...issues, ...resources.right[0], info({ ...msg("no relevant resources") }) ];
        } else {
            issues = [ ...issues, ...resources.right[0], info({ ...msg("number of relevant resources: " + resources.right[1].length) }) ];
        }

        const boxedConditions = pipe(resources.right[1], A.filter(FHIR_Condition_T.is), A.map(boxConditionResource));

        const resolveOptions = {
            codeSystems: [ ...await makeDefaultCodeSystemsList() ],
            textExtractionStrategy: pickFirstMerger,
            language: options.language
        };
        const resolver = resolveCodeableConceptTexts(resolveOptions);

        const [ issues0, resolvedConditions ] = await resolver(boxedConditions);

        issues = [ ...issues, ...issues0 ];

        const problemOrd: Ord<Problem_A> = fromCompare((a, b) => ordNumberInfinityRev.compare(b.period.min, a.period.min));
        const clinicalStatusOrd: Ord<Problem_A> = reverse(contramap((ai: Problem_A) => O.fromNullable(ai.clinicalStatus))(ordClinicalStatus));
        const problems = pipe(resolvedConditions, A.map(conditionToProblem), A.sortBy([ problemOrd, clinicalStatusOrd ]));

        return E.right([ issues, {
            model: {
                modelType: "ProblemList/1",
                problems
            }
        }]);
    };
}


function conditionToProblem (boxedCondition: BoxedCondition): Problem_A {
    return {
        period:             boxedCondition.period,

        problemId:          boxedCondition.boxed.id,
        problemIdentifier:  boxedCondition.boxed.identifier,

        clinicalStatus:     boxedCondition.clinicalStatus,
        verificationStatus: O.getOrElse(() => undefined)(boxedCondition.verificationStatus),

        code:               O.getOrElse(() => undefined)(boxedCondition.code),
        severity:           O.getOrElse(() => undefined)(boxedCondition.severity),
        category:           pipe(boxedCondition.category, A.map(O.getOrElse(() => undefined)), arr => arr.length === 0 ? undefined : arr)
    };
}

// ascending criticality order
const CRITICALITY_ORDER: string[] = [ "unable-to-assess", "low", "high" ];

export const ordCriticality: Ord<O.Option<FHIR_code_A>> = {

    equals: (x: O.Option<FHIR_code_A>, y: O.Option<FHIR_code_A>) => {
        return O.getEq(eqString).equals(x, y);
    },

    // eslint-disable-next-line complexity
    compare: (x: O.Option<FHIR_code_A>, y: O.Option<FHIR_code_A>) => {
        if (O.isNone(x) && O.isNone(y)) {
            return 0;
        }

        if (O.isNone(x)) {
            return -1;
        }

        if (O.isNone(y)) {
            return +1;
        }

        const ix = CRITICALITY_ORDER.indexOf(x.value);
        if (ix < 0) {
            return -1;
        }

        const iy = CRITICALITY_ORDER.indexOf(y.value);
        if (iy < 0) {
            return +1;
        }

        return sign(ix - iy);
    }
};

// ascending order
const CLINICAL_STATUS_ORDER = [ "resolved", "remission", "inactive", "relapse", "recurrence", "active" ];

function getCode (acc: O.Option<AnnotatedCodeableConcept_A>): O.Option<string> {
    if (O.isNone(acc)) {
        return O.none;
    }

    if (typeof acc.value.codeableConcept.coding === "undefined") {
        return O.none;
    }

    if (acc.value.codeableConcept.coding.length === 0) {
        return O.none;
    }

    return O.fromNullable(acc.value.codeableConcept.coding[0].code);
}

export const ordClinicalStatus: Ord<O.Option<AnnotatedCodeableConcept_A>> = {

    equals: (x: O.Option<AnnotatedCodeableConcept_A>, y: O.Option<AnnotatedCodeableConcept_A>) => {
        return O.getEq(eqString).equals(getCode(x), getCode(y));
    },

    // eslint-disable-next-line complexity
    compare: (x: O.Option<AnnotatedCodeableConcept_A>, y: O.Option<AnnotatedCodeableConcept_A>) => {
        const xc = getCode(x);
        const yc = getCode(y);

        if (O.isNone(xc) && O.isNone(yc)) {
            return 0;
        }

        if (O.isNone(xc)) {
            return -1;
        }

        if (O.isNone(yc)) {
            return +1;
        }

        const ix = CLINICAL_STATUS_ORDER.indexOf(xc.value);
        if (ix < 0) {
            return -1;
        }

        const iy = CLINICAL_STATUS_ORDER.indexOf(yc.value);
        if (iy < 0) {
            return +1;
        }

        return sign(ix - iy);
    }
};


export function readAllergyIntoleranceList (options: ModelReaderOptions): T.Task<EitherIssueResult<AllergyIntoleranceListResult_A>> {
    return async () => {
        let issues: IssueList_A = [];

        const resources = await getResources({ sdk: options.sdk, resourceTypes: [ "AllergyIntolerance" ] })();
        if (E.isLeft(resources)) {
            return resources;
        }

        if (resources.right[1].length === 0) {
            issues = [ ...issues, ...resources.right[0], info({ ...msg("no relevant resources") }) ];
        } else {
            issues = [ ...issues, ...resources.right[0], info({ ...msg("number of relevant resources: " + resources.right[1].length) }) ];
        }

        const boxedAIs = pipe(resources.right[1], A.filter(FHIR_AllergyIntolerance_T.is), A.map(boxAllergyIntoleranceResource));

        const resolveOptions = {
            codeSystems: [ ...await makeDefaultCodeSystemsList() ],
            textExtractionStrategy: pickFirstMerger,
            language: options.language
        };
        const resolver = resolveCodeableConceptTexts(resolveOptions);

        const [ issues0, resolvedAIs ] = await resolver(boxedAIs);

        issues = [ ...issues, ...issues0 ];

        const ordAI:        Ord<AllergyIntolerance_A> = reverse(contramap((ai: AllergyIntolerance_A) => O.fromNullable(ai.criticality))(ordCriticality));
        const periodMinOrd: Ord<AllergyIntolerance_A> = reverse(fromCompare((a, b) => ordNumber.compare(a.period.min, b.period.min)));
        const allergyIntolerances = pipe(resolvedAIs, A.map(aiToAI), A.sortBy([ ordAI, periodMinOrd ]));

        return E.right([ issues, {
            model: {
                modelType: "AllergyIntoleranceList/1",
                allergyIntolerances
            }
        }]);
    };
}


function aiToAI (boxedAI: BoxedAllergyIntolerance): AllergyIntolerance_A {
    const ai: AllergyIntolerance_A = {
        period:             boxedAI.period,

        allergyIntoleranceId: boxedAI.boxed.id,
        allergyIntoleranceIdentifier: boxedAI.boxed.identifier,

        clinicalStatus:     O.getOrElse(() => undefined)(boxedAI.clinicalStatus),
        verificationStatus: O.getOrElse(() => undefined)(boxedAI.verificationStatus),

        code:               O.getOrElse(() => undefined)(boxedAI.code),
        criticality:        boxedAI.boxed.criticality,
        criticalityConcept: O.getOrElse(() => undefined)(boxedAI.criticalityConcept)
    };

    if (boxedAI.reaction.length > 0) {
        ai.reactions = [];

        for (let i = 0; i < boxedAI.reaction.length; i++) {
            ai.reactions.push({
                severity:       boxedAI.boxed.reaction[i].severity,
                onset:          pipe(boxedAI.boxed.reaction[i].onset, O.fromNullable, O.map(Tau_valueOf_floor), O.getOrElse(() => undefined)),
                manifestations: boxedAI.reaction[i].manifestation,
                substance:      O.getOrElse(() => undefined)(boxedAI.reaction[i].substance),
                exposureRoute:  O.getOrElse(() => undefined)(boxedAI.reaction[i].exposureRoute)
            });
        }
    }

    return ai;
}
