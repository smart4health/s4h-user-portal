import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { FHIR_ValueSet_A } from "../../fhir-resources/types";


export const pickValueSetUrlVersionLanguage = (valueSets: FHIR_ValueSet_A[]):
    (valueSetUrl: string, version: O.Option<string>, language: O.Option<string>) => O.Option<FHIR_ValueSet_A> => (valueSetUrl, version, language) => {

    const res = pipe(valueSets,
        A.filter(vs => vs.url === valueSetUrl),
        A.filter(propEq("version")(version)),
        A.filter(propEq("language")(language))
    );

    if (res.length === 0) {
        return O.none;
    }

    if (res.length === 1) {
        return O.some(res[0]);
    }

    return O.some(res[0]);
};

const propEq = <T>(propName: string): (value: O.Option<T>) => (vs: FHIR_ValueSet_A) => boolean => value => vs => {
    if (O.isNone(value)) { return true; }

    const propValue = vs[propName];
    if (typeof propValue !== "undefined") {
        return propValue === value.value;
    }
    return true;
};
