import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { AxiosStatic } from "axios";

import { FHIR_Coding_A } from "../../../fhir-resources/types";
import { IssueList_A, ctx, msg, warn } from "../../../utils/issues";

import { CodeSystems, CodingResolutionError_T, ResolvedCoding_A, ResolvedCoding_T } from "../defs";


export type CodingServiceCodeSystemsConfig = {
    serviceOrigin: string;
    axios:         AxiosStatic;
};

export function makeCodingServiceCodeSystems (config: CodingServiceCodeSystemsConfig): CodeSystems {
    return {
        resolveCodings (codings: FHIR_Coding_A[], language: O.Option<string>): T.Task<E.Either<IssueList_A, ResolvedCoding_A>[]> {
            return async () => {

                function parseRawCoding (i: number, rawCoding: unknown): E.Either<IssueList_A, ResolvedCoding_A> {
                    if (ResolvedCoding_T.is(rawCoding)) {
                        return E.right({
                            ...rawCoding,
                            userSelected: codings[i].userSelected
                        });

                    } else if (CodingResolutionError_T.is(rawCoding)) {
                        return E.left(pipe(rawCoding.errors, A.map(err => warn({ ...msg(err) }))));

                    } else {
                        return E.left([ warn({ ...msg("invalid resolved coding, see context"), ...ctx({ coding: rawCoding }) }) ]);
                    }
                }

                try {
                    const lang = pipe(language,
                        O.map(encodeURIComponent),
                        O.map(s => "?lang=" + s),
                        O.getOrElse(() => "")
                    );

                    const response = await config.axios.post<unknown>(config.serviceOrigin + lang, codings);
                    if (response.data instanceof Array) {
                        return pipe(response.data, A.mapWithIndex(parseRawCoding));

                    } else {
                        return pipe(codings, A.map(coding => E.left([ warn({ ...msg("response of coding service is not an array"), ...ctx({ coding }) }) ])));
                    }

                } catch (error) {
                    return pipe(codings, A.map(coding => E.left([ warn({ ...msg(error), ...ctx({ coding }) }) ])));
                }
            };
        }
    };
}
