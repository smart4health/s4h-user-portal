import { pipe } from "fp-ts/function";

import { AxiosStatic } from "axios";

import { makeCannedValueSet } from "../canned/canned";
import { ValueSet, ValueSetLookupCoding_A, ValueSetSearchCoding_A, ValueSetSourceLookupParameters, ValueSetSourceSearchParameters } from "../defs";


export type SequenceValueSetConfig = {
    valueSets: ValueSet[];
};

export async function makeSequenceValueSet (config: SequenceValueSetConfig): Promise<ValueSet> {
    return {
        async lookup (params: ValueSetSourceLookupParameters): Promise<ValueSetLookupCoding_A[]> {
            for (const valueSet of config.valueSets) {
                try {
                    const codings = await valueSet.lookup(params);
                    if (codings.length > 0) {
                        return codings;
                    }
                // eslint-disable-next-line no-empty
                } catch (ignore) { }
            }
            return [];
        },

        async search (params: ValueSetSourceSearchParameters): Promise<ValueSetSearchCoding_A[]>  {
            for (const valueSet of config.valueSets) {
                try {
                    const codings = await valueSet.search(params);
                    if (codings.length > 0) {
                        return codings;
                    }
                // eslint-disable-next-line no-empty
                } catch (ignore) { }
            }
            return [];
        },

        language (): string | undefined {
            return pipe(config.valueSets,
                vss => vss.length === 0 ? undefined : vss[0].language()
            );
        }
    };
}

export type ReadymadeValueSetConfig = {
    valueSetUrl: string;
    version?:    string;
    language?:   string;
    axios:       AxiosStatic;
};

export async function makeReadymadeValueSet (config: ReadymadeValueSetConfig): Promise<ValueSet> {
    return makeCannedValueSet(config);
}
