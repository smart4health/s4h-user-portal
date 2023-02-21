import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { AxiosStatic } from "axios";

import { fallback, join, pair } from "../../../utils/fp-tools";
import { Issue, err, issueErrorExternal, msg } from "../../../utils/issues";
import { FHIR_ValueSet_A, FHIR_ValueSet_T } from "../../../fhir-resources/types";

import { pickValueSetUrlVersionLanguage } from "../logic";
import { ValueSet, ValueSetLookupCoding_A, ValueSetLookupCoding_T, ValueSetSearchCoding_A, ValueSetSourceLookupParameters, ValueSetSourceSearchParameters } from "../defs";


export type CodingServiceValueSetConfig = {
    valueSetUrl:   string;
    version?:      string;
    language?:     string;
    serviceOrigin: string;
    axios:         AxiosStatic;
};

let VALUE_SET_INFOS: FHIR_ValueSet_A[] = [];

export async function makeCodingServiceValueSet (config: CodingServiceValueSetConfig): Promise<ValueSet> {
    await setupValueSetInfos(config.axios, config.serviceOrigin);

    return {
        async lookup (params: ValueSetSourceLookupParameters): Promise<ValueSetLookupCoding_A[]> {
            const serviceUrl = lookupParamsToHref(params, "/contents");
            if (E.isLeft(serviceUrl)) {
                throw [ serviceUrl.left ];
            }

            try {
                const response = await config.axios.get(serviceUrl.right, { validateStatus: okayBelow(500) });
                return pipe(response.data,
                    A.map(ValueSetLookupCoding_T.decode),
                    A.rights
                );

            } catch (error) {
                throw [ err({ ...msg(error) }) ];
            }
        },

        async search (params: ValueSetSourceSearchParameters): Promise<ValueSetSearchCoding_A[]> {
            const serviceUrl = searchParamsToHref(params, "/search");
            if (E.isLeft(serviceUrl)) {
                throw [ serviceUrl.left ];
            }
            try {
                const response = await config.axios.get(serviceUrl.right, { validateStatus: okayBelow(500) });
                return pipe(response.data,
                    A.map(ValueSetLookupCoding_T.decode),
                    A.rights
                );

            } catch (error) {
                throw [ err({ ...msg(error) }) ];
            }
        },

        language (): string | undefined {
            return config.language;
        }
    };


    function lookupParamsToHref (params: ValueSetSourceLookupParameters, pathSuffix: string): E.Either<Issue, string> {
        const vs = pickValueSetUrlVersionLanguage(VALUE_SET_INFOS)(
            config.valueSetUrl, O.fromNullable(config.version), O.fromNullable(config.language)
        );

        if (O.isNone(vs)) { return E.left(issueErrorExternal("could not pick value set")); }

        const limit  = pipe(params.limit,      O.fromNullable, fallback(-1), pair("limit"));
        const offset = pipe(params.offset,     O.fromNullable, fallback( 0), pair("offset"));
        const lang   = pipe(vs.value.language, O.fromNullable, O.map(l => [ "lang", l ]), fallback([]));

        return pipe([
            config.serviceOrigin,
            "/v1/valuesets/", encodeURIComponent(config.valueSetUrl), "/", encodeURIComponent(vs.value.version), pathSuffix, "?",
            pipe([ limit, offset, ...[ lang ] ], A.map(join("=")), join("&"))
        ], join(""), E.right);
    }

    function searchParamsToHref (params: ValueSetSourceSearchParameters, pathSuffix: string): E.Either<Issue, string> {
        const vs = pickValueSetUrlVersionLanguage(VALUE_SET_INFOS)(
            config.valueSetUrl, O.fromNullable(config.version), O.fromNullable(config.language)
        );

        if (O.isNone(vs)) { return E.left(issueErrorExternal("could not pick value set")); }

        const limit        = pipe(params.limit,  O.fromNullable, fallback(-1), pair("limit"));
        const offset       = pipe(params.offset, O.fromNullable, fallback( 0), pair("offset"));
        const lang         = pipe(vs.value.language,              O.fromNullable, O.map(pair("lang")), fallback([]));
        const leftBracket  = pipe(params.highlight?.leftBracket,  O.fromNullable, O.map(encodeURIComponent), O.map(pair("leftBracket")),  fallback([]));
        const rightBracket = pipe(params.highlight?.rightBracket, O.fromNullable, O.map(encodeURIComponent), O.map(pair("rightBracket")), fallback([]));

        return pipe([
            config.serviceOrigin,
            "/v1/valuesets/", encodeURIComponent(config.valueSetUrl), "/", encodeURIComponent(vs.value.version), pathSuffix, "?",
            pipe([ [ "q", encodeURIComponent(params.query) ],
                    limit, offset,
                    ...[ lang ],
                    ...[ leftBracket ], ...[ rightBracket ]
                ],
                A.map(join("=")),
                join("&")
            )
        ], join(""), E.right);
    }
}

const okayBelow = (maxStatus: number): (status: number) => boolean => status => status < maxStatus;

const toArray = (obj: unknown): unknown[] => obj instanceof Array ? obj : [];

async function setupValueSetInfos (axios: AxiosStatic, serviceOrigin: string): Promise<void> {
    if (VALUE_SET_INFOS.length > 0) { return; }

    try {
        const res = await axios.get(serviceOrigin + "/v1/valuesets");
        VALUE_SET_INFOS = pipe(res.data,
            toArray,
            A.map(FHIR_ValueSet_T.decode),
            A.rights
        );

    } catch (error) {
        // This is one of two (production) console messages in this library.
        // This initialization
        // eslint-disable-next-line no-console
        console.warn("value set source error:", error.message);
    }
}
