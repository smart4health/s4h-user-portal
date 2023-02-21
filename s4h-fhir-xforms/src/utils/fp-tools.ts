import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Predicate } from "fp-ts/function";
import { Eq as eqString } from "fp-ts/string";

import { IssueList_A, Issue_A, err, msg } from "./issues";


export function optionDateToStringOrUndefined (date: O.Option<Date>): string | undefined {
    if (O.isSome(date)) {
        return date.value.toISOString();
    } else {
        return undefined;
    }
}

export const someDate = (s: string): O.Option<Date> => O.some(new Date(s));

export const arrayContains = (pred: Predicate<unknown>): (arr?: unknown[]) => boolean => arr => O.isSome(A.findFirst(pred)(arr ?? []));

export const firstElement = <T>(arr: T[]): O.Option<T> => {
    return arr.length === 0 ? O.none : O.some(arr[0]);
};

export const fallback = <T>(v: T): (o: O.Option<T>) => T => O.getOrElse(() => v);

export const pair = <T>(s: string): (x: T) => [string, T] => x => [ s, x ];

export const join = <T>(sep: string): (xs: T[]) => string => xs => xs.join(sep);

export const eitherArrayOrIssue = (obj: unknown): E.Either<Issue_A, unknown> =>
    obj instanceof Array ? E.right(obj) : E.left(err({ ...msg("response is not an array") }));

export const noneIfEmpty: <T>(xs: T[]) => O.Option<T[]> = x => x.length === 0 ? O.none : O.some(x);

export const curriedFlip = <T, C>(f: (a: T) => (b: T) => C): (b: T) => (a: T) => C => (a: T) => (b: T) => f(b)(a);

export type DistributiveOmit<T, K extends keyof T> = T extends unknown
    ? Omit<T, K>
    : never;

export const pickSingleOrUndefined = <T>(arr: T[]): T | undefined => arr.length === 1 ? arr[0] : undefined;

export const apply = <B>(f: () => B): B => f();

export type EitherIssueResult<T> = E.Either<IssueList_A, [ IssueList_A, T ]>;

export const exec = <T>(f: () => T): T => f();

/**
 * Maker function for codec that provides a tagged union needed for FHIR properties like `value[x]`.
 *
 * Some FHIR resources have properties that can assume different data types. See, for example,
 * [Patient](https://www.hl7.org/fhir/patient.html) with `deceased[x]` and `multipleBirth[x]`, or
 * [Observation](https://www.hl7.org/fhir/observation.html) with `effective[x]` and `value[x]`.
 *
 * To model those properties appropriately, we need to define a tagged union (because only one value
 * at most can be present), but need to make sure we do not expose the tag property, because this
 * might break downstream consumers.
 *
 * This function takes a union codec and provides `encode` and `validate` functions that properly handle
 * the union's tag property.
 *
 * Use this function as shown in e.g. `FHIR_Observation_T` for the `effective[x]` property.
 *
 * @param codec           Codec of the tagged union
 * @param typeClassName   Name for the new codec
 * @param tagProp         Name of the tag property (for addition or removal)
 *
 * @returns               Codec for the tagged union `codec` with the above behavior added
 */
export function makeTaggedUnionTypeClass<
    Static,
    Output,
    InternalC extends t.UnionC<[ t.TypeC<t.Props>, t.TypeC<t.Props>, ...Array<t.TypeC<t.Props>> ]>
> (codec: InternalC, typeClassName: string, tagProp: string): t.Type<Static, Output, unknown> {

    return new t.Type<Static, Output, unknown>(
        typeClassName,

        // Is
        (x: unknown): x is Static => codec.is(x),

        // Validate I -> Either<Errors, A>
        (x, c) => {
            if (typeof x !== "object") {
                return t.failure(x, c, "expect object, but got " + typeof x);
            }

            const unionOptions = pipe(codec.types, A.map(typeInfo => typeInfo.name));
            const objProps = Object.keys(x);

            const unionProp = A.intersection(eqString)(unionOptions)(objProps);
            if (unionProp.length === 0){
                return t.success({ [ tagProp ]: "none" } as unknown as Static );
            }
            if (unionProp.length > 1) {
                return t.failure(x, c, `expect exactly one property, but got ${unionProp.length} (${unionProp.join()})`);
            }

            const prop = unionProp[0];

            for (const typeInfo of codec.types) {
                if (typeInfo.name === prop) {
                    return pipe(x[prop],
                        typeInfo.props[prop].decode as ((x: unknown) => E.Either<t.Errors, unknown>),
                        E.map(z => ({
                            [ tagProp ]: prop,
                            [ prop ]: z
                        }) as unknown as Static)
                    );
                }
            }
            return t.failure(x, c, "unknown prop: " + prop);
        },

        // Encode A -> O
        (x) => ({ ...codec.encode(x), [ tagProp ]: undefined }) as unknown as Output
    );
}
