import { err, msg } from "../../../utils/issues";

import { ValueSet, ValueSetLookupCoding_A, ValueSetSearchCoding_A, ValueSetSourceLookupParameters, ValueSetSourceSearchParameters } from "../defs";


export type MemoizeValueSetConfig = {
    valueSet: ValueSet;
};

export async function makeMemoizeValueSet (config: MemoizeValueSetConfig): Promise<ValueSet> {
    const lookupCache: Record<string, ValueSetLookupCoding_A[]> = {};
    const searchCache: Record<string, ValueSetSearchCoding_A[]> = {};

    return {
        async lookup (params: ValueSetSourceLookupParameters): Promise<ValueSetLookupCoding_A[]>  {
            const key = lookupKey(params);
            if (key in lookupCache) {
                return lookupCache[key];
            }

            try {
                const codings = await config.valueSet.lookup(params);
                lookupCache[key] = codings;
            } catch (e) {
                throw [ err({ ...msg(e) }) ];
            }
        },

        async search (params: ValueSetSourceSearchParameters): Promise<ValueSetSearchCoding_A[]> {
            const key = searchKey(params);
            if (key in searchCache) {
                return searchCache[key];
            }

            try {
                const codings = await config.valueSet.search(params);
                searchCache[key] = codings;
            } catch (e) {
                throw [ err({ ...msg(e) }) ];
            }
        },

        language (): string | undefined {
            return config.valueSet.language();
        }
    };
}

function lookupKey (params: ValueSetSourceLookupParameters): string {
    return `${params.limit}|${params.offset}`;
}

function searchKey (params: ValueSetSourceSearchParameters): string {
    return `${params.query}|${params.limit}|${params.offset}|${JSON.stringify(params.highlight)}`;
}
