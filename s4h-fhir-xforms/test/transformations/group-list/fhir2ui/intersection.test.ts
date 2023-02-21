/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import * as A from "fp-ts/Array";
import { Eq, eqNumber, eqString, getStructEq } from "fp-ts/Eq";

/*
 * In function `encounterTypesToGroupType` we use `A.intersection` and rely on the fact that the elements
 * of the result set are taken from (and its order determined by) the **first** array.
 * See here: https://gcanti.github.io/fp-ts/modules/Array.ts.html#intersection
 *
 * However, when using the function, it turns out that the **second** array is determining the output.
 * I am not sure whether I misread what the `fp-ts` authors consider first or second in the curried
 * context, or whether this is a documentation glitch, or whether it is a bug which might be fixed
 * in a subsequent release.
 *
 * In case it is the latter, we need to find out whether the above behavior silently swaps (technically,
 * changing this behavior is a breaking change, but let's better be safe and check).
 *
 * So, in case the `A.intersection` behavior changes regarding the output source, both `expect`s
 * in the "intersection order check" will fail. In that case we just need to remove the
 * application of `curriedFlip` in `encounterTypesToGroupType`.
 */

type Foo = {
    a: string;
    b: number;

    c?: string;
};

const eqFoo: Eq<Foo> = getStructEq({
    a: eqString,
    b: eqNumber
});

describe("intersection check", () => {

    const x: Foo[] = [
        { a: "one",   b: 1, c: "eins" },
        { a: "two",   b: 2, c: "zwei" },
        { a: "three", b: 3, c: "drei" },
        { a: "four",  b: 4, c: "vier" }
    ];

    const y: Foo[] = [
        { a: "zero",  b: 0 },
        { a: "two",   b: 2 },
        { a: "four",  b: 4 },
        { a: "five",  b: 5 },
        { a: "siz",   b: 6 }
    ];

    it("test eqFoo", () => {
        expect(eqFoo.equals(x[1], y[1])).to.be.true;
        expect(eqFoo.equals(x[3], y[2])).to.be.true;

        expect(eqFoo.equals(x[0], y[0])).to.be.false;
    });

    /*
     * If, after an `fp-ts` upgrade this test fails, double check that
     * the authors indeed changed the `A.intersection` function and adjust our code,
     * that is, remove the application of `curriedFlip` in `encounterTypesToGroupType`.
     */
    it("intersection order check", () => {
        const intXY = A.intersection(eqFoo)(x)(y);
        const intYX = A.intersection(eqFoo)(y)(x);

        expect(intXY).to.deep.include.members([
            { a: "two",   b: 2 },
            { a: "four",  b: 4 }
        ]);

        expect(intYX).to.deep.include.members([
            { a: "two",   b: 2, c: "zwei" },
            { a: "four",  b: 4, c: "vier" }
        ]);

    });

});
