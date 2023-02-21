import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { FHIR_Coding_A } from "../../../fhir-resources/types";
import { IssueList_A, ctx, warn } from "../../../utils/issues";

import { ValueSet, ValueSetLookupCoding_A } from "../../value-sets/defs";

import { CodeSystems, ResolvedCoding_A } from "../defs";


export type ValueSetSourcedCodeSystemsConfig = {
    valueSet: ValueSet;
};

export function makeValueSetSourcedCodeSystems (config: ValueSetSourcedCodeSystemsConfig): CodeSystems {
    const makeIssuesForCodings = (codings: FHIR_Coding_A[], message: string): E.Either<IssueList_A, never>[] =>
        pipe(codings,
            A.map(coding => E.left([ warn({ message, ...ctx({ coding }) }) ]))
        );

    return {
        resolveCodings (codings: FHIR_Coding_A[], language: O.Option<string>): T.Task<E.Either<IssueList_A, ResolvedCoding_A>[]> {
            return async () => {

                // (*) Exit early if a language is requested which does not match the value set's language
                if (O.isSome(language)) {
                    const vsLanguage = O.fromNullable(config.valueSet.language());
                    if (O.isSome(vsLanguage)) {
                        if (language.value !== vsLanguage.value) {
                            return makeIssuesForCodings(codings, `value set language mismatch: ${language.value} vs ${vsLanguage.value}`);
                        }
                    }
                }

                // From now onward, we can ignore the language parameter:
                // - Either it is `O.none`, then it does not matter anyway.
                // - Or it is `O.some` and arriving here means that it matches the value set's language (if it has one).
                //   - If the lookups below are successful, then the language must match, because we checked above (*).
                //   - If the lookups below fail, then the language "of the unfound coding" does not matter.
                // Note: If the language parameter is `O.some` and the value set's language is `O.none`, we ignore the requested language.

                try {
                    const contents = await config.valueSet.lookup({});
                    return pipe(codings, A.map(lookup(contents, O.fromNullable(config.valueSet.language()))));

                } catch (issues) {
                    return makeIssuesForCodings(codings, "value set empty");
                }
            };
        }
    };
}

const na = (): string => "N/A";

const lookup = (valueSetContents: ValueSetLookupCoding_A[], valueSetLanguage: O.Option<string>):
    (coding: FHIR_Coding_A) => E.Either<IssueList_A, ResolvedCoding_A> => coding => {

    return pipe(valueSetContents,
        A.filter(c => c.system === coding.system && c.code === coding.code),
        codings => codings.length === 0
            ? E.left([{ severity: "warning", message: "not found: " + JSON.stringify(coding), tags: { "concept-resolution": null } }])
            : E.right({
                system:          codings[0].system,
                code:            codings[0].code,
                resolvedDisplay: codings[0].display,
                version:        "N/A",
                language:        O.getOrElse(na)(valueSetLanguage)
            })
    );
};
