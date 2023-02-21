import * as t from "io-ts";


export const Period_T = t.type({
    period: t.type({
        min: t.number,
        max: t.number
    })
});

export type Period_A = t.TypeOf<  typeof Period_T>;
export type Period   = t.OutputOf<typeof Period_T>;


export interface BoxedResource<T> extends Period {
    boxed: T;
}

