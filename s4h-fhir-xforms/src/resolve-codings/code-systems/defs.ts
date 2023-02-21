import * as t from "io-ts";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { Task } from "fp-ts/Task";

import { IssueList_A } from "../../utils/issues";
import { FHIR_Coding_A } from "../../fhir-resources/types";


export const ResolvedCoding_T = t.type({
    language:        t.string,
    version:         t.string,
    resolvedDisplay: t.string
});

export type ResolvedCoding_A = t.TypeOf<typeof ResolvedCoding_T>;

export type AugmentedResolvedCoding = {
    resolvedDisplay: O.Option<string>;
    originalDisplay: O.Option<string>;
    userSelected:    O.Option<boolean>;
};


export const CodingResolutionError_T = t.type({
    errors: t.array(t.string)
});

export interface CodeSystems {
    resolveCodings (codings: FHIR_Coding_A[], language: O.Option<string>): Task<E.Either<IssueList_A, ResolvedCoding_A>[]>;
}
