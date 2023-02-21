import * as t from "io-ts";
import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { flow, pipe } from "fp-ts/function";

import { AxiosStatic } from "axios";

import { exec } from "../../../utils/fp-tools";
import { IssueList_A, warn } from "../../../utils/issues";
import { FHIR_Coding_A } from "../../../fhir-resources/types";

import { CodeSystems, ResolvedCoding_A } from "../defs";

import { getCodeSystemIdent } from "./mappings";


export type StaticResourceCodeSystemsConfig = {
    basePath?:      string; // defaults to '/static/media'
    axios:          AxiosStatic;
};

const RawData_T = t.type({
    system:   t.string,
    language: t.string,
    code:     t.array(t.string),
    display:  t.array(t.string)
});
export type RawData_A = t.TypeOf<  typeof RawData_T>;
export type RawData   = t.OutputOf<typeof RawData_T>;


let CACHE: Record<string, Record<string, Record<string, string>>> = {};

export function purgeCache (): void {
    CACHE = {};
}

export function makeStaticResourceCodeSystems (config: StaticResourceCodeSystemsConfig): CodeSystems {
    return {
        resolveCodings (codings: FHIR_Coding_A[], language: O.Option<string>): T.Task<E.Either<IssueList_A, ResolvedCoding_A>[]> {

            // Look up a single coding in DB
            function lookup (coding: FHIR_Coding_A): T.Task<E.Either<IssueList_A, ResolvedCoding_A>> {
                return async () => {
                    const codingSystemIdent = getCodeSystemIdent(coding.system);
                    if (O.isNone(codingSystemIdent)) {
                        return E.left([ warn({ message: `unknown coding system: ${coding.system}` }) ]);
                    }

                    const codeSystemKey = `${codingSystemIdent.value.codeSystemName}/${codingSystemIdent.value.codeSystemEdition}/${codingSystemIdent.value.codeSystemVersion}`;

                    const hash = await sha256(`${codeSystemKey}/${coding.code}`);
                    const chNo = chunkNumber(hash[0], hash[1], codingSystemIdent.value.prefixLengthBits);
                    const bucketName = chunkName(chNo);

                    let languageCodeMap = CACHE[`${codeSystemKey}/${bucketName}`];
                    if (typeof languageCodeMap === "undefined") {
                        try {
                            const response = await config.axios.get(`${config.basePath ?? "/static/media"}/${codeSystemKey}/${bucketName.substr(0, 2)}/${bucketName.substr(2, 2)}.json`);
                            languageCodeMap = response.data;
                            CACHE[`${codeSystemKey}/${bucketName}`] = languageCodeMap;

                        } catch (error) {
                            return E.left([ warn({ message: "could not get code bucket; see context", context: { codeSystemKey, error } }) ]);
                        }
                    }

                    const resolvedCoding = findDisplay(languageCodeMap, coding.code, language, codingSystemIdent.value.codeSystemVersion);
                    return E.fromOption(() => [ warn({ message: "could not resolve coding; see context", context: coding }) ])(resolvedCoding);
                };
            }

            return async () => Promise.all(pipe(codings,
                A.map( flow(T.of, T.map(lookup), T.flatten, exec) )
            ));
        }
    };
}

// eslint-disable-next-line max-params
function findDisplay (langueCodeMap: Record<string, Record<string, string>>, code: string, language: O.Option<string>, version: string): O.Option<ResolvedCoding_A> {
    const langMap = langueCodeMap[code];
    if (typeof langMap === "undefined") {
        return O.none;
    }

    if (O.isSome(language)) {
        const display = langMap[language.value];
        if (typeof display === "undefined") {
            return O.none;
        }

        return O.some({
            language: language.value,
            resolvedDisplay: display,
            version
        });

    } else {
        const languages = Object.keys(langMap);
        if (languages.length === 0) {
            // should not happen, but well...
            return O.none;
        }

        if (languages.length === 1) {
            return O.some({
                language: languages[0],
                resolvedDisplay: langMap[languages[0]],
                version
            });
        }

        if (languages.indexOf("en") !== -1) {
            return O.some({
                language: "en",
                resolvedDisplay: langMap["en"],
                version
            });
        }

        return O.some({
            language: languages[0],
            resolvedDisplay: langMap[languages[0]],
            version
        });
    }
}


async function sha256 (message: string): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message)));
}

export function leftPadZero (s: string, len: number): string {
    return Array(len - s.length + 1).join("0") + s;
}

export function chunkNumber (byte0: number, byte1: number, bits: number): number {
    if (bits <= 8) {
        return byte0 >> (8 - bits);
    }

    if (bits > 8) {
        return (byte0 << (bits - 8)) | (byte1 >> (16 - bits));
    }
}

export function chunkName (chNo: number): string {
    return leftPadZero(chNo.toString(16), 4);
}
