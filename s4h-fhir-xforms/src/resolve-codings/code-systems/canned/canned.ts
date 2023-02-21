import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";

import { IssueList_A, Issue_A } from "../../../utils/issues";
import { FHIR_Coding_A } from "../../../fhir-resources/types";

import { CodeSystems, ResolvedCoding_A } from "../defs";

import { LanguageCoding, getCannedCodeSystem } from "./data/canned-code-systems";


type SystemCode = string;
type Language   = string;
type Display    = string;

type CodingDb = Record<SystemCode, Record<Language, Display>>;

const key = (c: FHIR_Coding_A): SystemCode => c.system + "|" + c.code;
const DEFAULT_LANGUAGE = "en";

export type CannedCodeSystemsConfig = {
    canName:  string;
    codings?: LanguageCoding[];
};

export function makeCannedCodeSystems (config: CannedCodeSystemsConfig): CodeSystems {
    const notFoundIssue = (coding: FHIR_Coding_A, language: O.Option<string>): Issue_A => ({
        severity: "warning",
        message: [
            `internal ${config.canName}: not found:`,
            `${coding.system} / ${coding.code} /`,
            O.getOrElse(() => "no language")(language)
        ].join(" "),
        tags: { "coding-resolution": null, "canned": null }
    });

    let DB: CodingDb;
    if (typeof config.codings !== "undefined") {
        DB = loadCodings(config.codings);
    } else {
        DB = loadCodings(O.getOrElse(() => [])(getCannedCodeSystem(config.canName)));
    }

    return {
        resolveCodings (codings: FHIR_Coding_A[], language: O.Option<string>): T.Task<E.Either<IssueList_A, ResolvedCoding_A>[]> {

            // Look up a single coding in DB
            function lookup (coding: FHIR_Coding_A): E.Either<IssueList_A, ResolvedCoding_A> {
                // (*) Get display texts for all languages of the coding
                const displayTexts: O.Option<Record<Language, Display>> = R.lookup(key(coding), DB);
                if (O.isNone(displayTexts)) {
                    return E.left([ notFoundIssue(coding, language) ]);
                }

                // If a desired language is given, try to find that language.  If it does not exist, return error issue.
                if (O.isSome(language)) {
                    return pipe(R.lookup(language.value, displayTexts.value),
                        O.map( display => ({ resolvedDisplay: display, language: language.value, version: "N/A" })),
                        E.fromOption(() => [ notFoundIssue(coding, language) ])
                    );
                }

                // If we arrive here, the coding has at least one display text in the DB and there is no special language requested.
                const languages = R.keys(displayTexts.value);
                if (languages.length === 0) {
                    // This case should not happen, because if there are no display texts, the lookup (*)
                    // should have failed already.  But technically, the response of (*) could be `O.some({})` instead if `O.none`.
                    return E.left([ notFoundIssue(coding, language) ]);
                }

                // If there is a display text for the default language, return it.
                // Else, return the first display text.
                return pipe(languages,
                    A.findIndex(s => s === DEFAULT_LANGUAGE),
                    O.getOrElse(() => 0),
                    i => E.right({
                        resolvedDisplay: displayTexts.value[languages[i]],
                        language:        languages[i],
                        version:        "N/A"
                    })
                );
            }

            return T.of(A.map(lookup)(codings));
        }
    };
}

function loadCodings (codings: LanguageCoding[]): CodingDb {
    const db: CodingDb = {};
    for (const coding of codings) {
        const map = getOrMake(db, key(coding));
        map[coding.language] = coding.display;
    }
    return db;
}

const getOrMake = <T>(map: Record<string, Record<string, T>>, key: string): Record<string, T> => {
    if (!(key in map)) {
        map[key] = {};
    }
    return map[key];
};
