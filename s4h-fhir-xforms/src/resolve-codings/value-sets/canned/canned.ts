import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { contramap } from "fp-ts/Ord";
import { Ord as ordString } from "fp-ts/string";

import { err, msg } from "../../../utils/issues";

import { ValueSet, ValueSetLookupCoding_A, ValueSetSearchCoding_A, ValueSetSourceLookupParameters, ValueSetSourceSearchParameters } from "../defs";

import { getValueSet } from "./data/value-sets";


export type CannedValueSetConfig = {
    valueSetUrl: string;
    version?:    string;
    language?:   string;
};

export async function makeCannedValueSet (config: CannedValueSetConfig): Promise<ValueSet> {
    const vs = getValueSet(config.valueSetUrl, O.fromNullable(config.version), O.fromNullable(config.language));

    return {
        async lookup (params: ValueSetSourceLookupParameters): Promise<ValueSetLookupCoding_A[]> {
            if (O.isNone(vs)) {
                return [];
            }

            if (params.offset < 0) {
                throw [ err({ ...msg("offset must not be negative") }) ];
            }

            if (typeof vs.value.expansion === "undefined") {
                throw [ err({ ...msg(`value set ${config.valueSetUrl} has no expansion`) }) ];
            }

            const bySystem = contramap((c: ValueSetLookupCoding_A) => c.system)(ordString);
            const byCode   = contramap((c: ValueSetLookupCoding_A) => c.code  )(ordString);

            return pipe(vs.value.expansion.contains,
                A.sortBy([ bySystem, byCode ]),
                cs => cs.slice(params.offset ?? 0),
                cs => cs.slice(0, limit(params.limit)),
                A.map(c => ({
                    system:  "" + c.system,
                    code:    "" + c.code,
                    display: "" + c.display
                }))
            );
        },

        async search (_params: ValueSetSourceSearchParameters): Promise<ValueSetSearchCoding_A[]> {
            throw [ err({ ...msg("search not implemented yet for canned value sets") }) ];
        },

        language (): string | undefined {
            return pipe(vs, O.mapNullable(vs => vs.language), O.getOrElse(() => undefined));
        }
    };
}

const limit = (n?: number): number => {
    if (typeof n === "number" && n > 0) { return n; }
    return Number.MAX_SAFE_INTEGER;
};
