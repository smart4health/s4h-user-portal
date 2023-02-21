import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";


export const UCUM_SUBSET_EN = pipe([
    // removed
], A.map(x => ({
    system:   "http://unitsofmeasure.org",
    language: "en",
    code:      x.c,
    display:   x.d
})));
