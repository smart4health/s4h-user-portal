import * as t from "io-ts";

import { Period_T } from "../../fhir-resources/base/boxed";
import { AnnotatedCodeableConcept_T, FHIR_Identifier_T, FHIR_code_T } from "../../fhir-resources/types";


export const Problem_T = t.intersection([
    Period_T,
    t.type({
        problemId:          t.string,
        clinicalStatus:     AnnotatedCodeableConcept_T
    }),
    t.partial({
        problemIdentifier:  t.array(FHIR_Identifier_T),

        verificationStatus: AnnotatedCodeableConcept_T,
        code:               AnnotatedCodeableConcept_T,
        severity:           AnnotatedCodeableConcept_T,
        category:           t.array(AnnotatedCodeableConcept_T)
    })
]);

export type Problem_A = t.TypeOf<  typeof Problem_T>;
export type Problem   = t.OutputOf<typeof Problem_T>;


export const ProblemList_T = t.type({
    modelType: t.literal("ProblemList/1"),
    problems:  t.array(Problem_T)
});

export type ProblemList_A = t.TypeOf<  typeof ProblemList_T>;
export type ProblemList   = t.OutputOf<typeof ProblemList_T>;


export const ProblemListResult_T = t.intersection([
    t.type({
        model: ProblemList_T
    }),
    t.partial({
        dot:   t.string
    })
]);

export type ProblemListResult_A = t.TypeOf<  typeof ProblemListResult_T>;
export type ProblemListResult   = t.OutputOf<typeof ProblemListResult_T>;



export const AllergyIntolerance_reaction_T = t.intersection([
    t.type({
        manifestations: t.array(AnnotatedCodeableConcept_T)
    }),
    t.partial({
        substance:     AnnotatedCodeableConcept_T,
        onset:         t.number,
        severity:      FHIR_code_T,
        exposureRoute: AnnotatedCodeableConcept_T
    })
]);

export type AllergyIntolerance_reaction_A = t.TypeOf<  typeof AllergyIntolerance_reaction_T>;
export type AllergyIntolerance_reaction   = t.OutputOf<typeof AllergyIntolerance_reaction_T>;


export const AllergyIntolerance_T = t.intersection([
    Period_T,
    t.type({
        allergyIntoleranceId: t.string
    }),
    t.partial({
        allergyIntoleranceIdentifier: t.array(FHIR_Identifier_T),
        clinicalStatus:       AnnotatedCodeableConcept_T,
        verificationStatus:   AnnotatedCodeableConcept_T,
        code:                 AnnotatedCodeableConcept_T,
        criticality:          t.string,
        criticalityConcept:   AnnotatedCodeableConcept_T,
        reactions:            t.array(AllergyIntolerance_reaction_T)
    })
]);

export type AllergyIntolerance_A = t.TypeOf<  typeof AllergyIntolerance_T>;
export type AllergyIntolerance   = t.OutputOf<typeof AllergyIntolerance_T>;


export const AllergyIntoleranceList_T = t.type({
    modelType: t.literal("AllergyIntoleranceList/1"),
    allergyIntolerances:  t.array(AllergyIntolerance_T)
});

export type AllergyIntoleranceList_A = t.TypeOf<  typeof AllergyIntoleranceList_T>;
export type AllergyIntoleranceList   = t.OutputOf<typeof AllergyIntoleranceList_T>;


export const AllergyIntoleranceListResult_T = t.intersection([
    t.type({
        model: AllergyIntoleranceList_T
    }),
    t.partial({
        dot:   t.string
    })
]);

export type AllergyIntoleranceListResult_A = t.TypeOf<  typeof AllergyIntoleranceListResult_T>;
export type AllergyIntoleranceListResult   = t.OutputOf<typeof AllergyIntoleranceListResult_T>;
