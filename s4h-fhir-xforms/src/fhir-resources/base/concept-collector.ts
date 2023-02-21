import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { ConceptResolver } from "../types";

import { BoxedResource } from "./boxed";
import { FHIR_CodeableConcept_T, FHIR_DomainResource_T, FHIR_Identifier_T } from "./general-special-purpose";


export const ConceptCollector_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        identifier: t.array(FHIR_Identifier_T),
        concepts:   t.array(FHIR_CodeableConcept_T)
    })
]);

export type ConceptCollector_A = t.TypeOf<  typeof ConceptCollector_T>;
export type ConceptCollector   = t.OutputOf<typeof ConceptCollector_T>;

export type BoxedConceptCollector = BoxedResource<ConceptCollector_A> & {
    concepts: O.Option<string>[];
};

export function boxConceptCollector (res: ConceptCollector_A): BoxedConceptCollector {
    return {
        boxed:  res,
        period: {
            min: -Infinity,
            max: +Infinity
        },

        concepts: []
    };
}

export function resolveConceptCollectorTexts (resolver: ConceptResolver, res: BoxedConceptCollector): void {
    Promise.all(pipe(res.boxed.concepts, A.map(resolver)))
        .then(texts => { res.concepts = texts; });
}
