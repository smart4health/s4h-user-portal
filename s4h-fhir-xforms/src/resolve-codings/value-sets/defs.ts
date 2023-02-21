import * as t from "io-ts";


/**
 * Value set lookup and search features
 */
export type ValueSetSourceLookupParameters = {
    offset?:    number;
    limit?:     number;
};

export const ValueSetLookupCoding_T = t.type({
    system:   t.string,
    code:     t.string,
    display:  t.string
});

export type ValueSetLookupCoding_A = t.TypeOf<  typeof ValueSetLookupCoding_T>;
export type ValueSetLookupCoding   = t.OutputOf<typeof ValueSetLookupCoding_T>;

export type ValueSetSourceSearchParameters = ValueSetSourceLookupParameters & {
    query: string;
    highlight?: {
        leftBracket:  string;
        rightBracket: string;
    };
};

export const ValueSetSearchCoding_T = t.intersection([
    ValueSetLookupCoding_T,
    t.partial({
        displayHighlighted: t.string
    })
]);

export type ValueSetSearchCoding_A = t.TypeOf<  typeof ValueSetSearchCoding_T>;
export type ValueSetSearchCoding   = t.OutputOf<typeof ValueSetSearchCoding_T>;


export interface ValueSet {
    lookup (params: ValueSetSourceLookupParameters): Promise<ValueSetLookupCoding_A[]>;
    search (params: ValueSetSourceSearchParameters): Promise<ValueSetSearchCoding_A[]>;
    language (): string | undefined;
}
