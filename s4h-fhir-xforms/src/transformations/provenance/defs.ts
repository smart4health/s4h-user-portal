import * as t from "io-ts";

import { AnnotatedCodeableConcept_T, FHIR_Identifier, FHIR_Reference_T } from "../../fhir-resources/types";

import { ModelReaderOptions } from "../syncer";


export type ProvenanceOptions = ModelReaderOptions & {
    resourceIdentifiers: FHIR_Identifier[][]
};

export const Provenance_T = t.intersection([
    t.type({
        id:        t.string,
        recorded:  t.number,
        agents:    t.array(t.intersection([
            t.type({
                who: FHIR_Reference_T
            }),
            t.partial({
                resolvedWho: t.string,
                type: AnnotatedCodeableConcept_T
            })
        ])),
        signature: t.number
    }),
    t.partial({
        activity:  AnnotatedCodeableConcept_T
    })
]);

export type Provenance_A = t.TypeOf<  typeof Provenance_T>;
export type Provenance   = t.OutputOf<typeof Provenance_T>;


export const ProvenanceList_T = t.type({
    modelType:   t.literal("ProvenanceList/1"),
    provenances: t.array(Provenance_T)
});

export type ProvenanceList_A = t.TypeOf<  typeof ProvenanceList_T>;
export type ProvenanceList   = t.OutputOf<typeof ProvenanceList_T>;


export const ProvenanceResult_T = t.type({
    model: ProvenanceList_T
});

export type ProvenanceResult_A = t.TypeOf<  typeof ProvenanceResult_T>;
export type ProvenanceResult   = t.OutputOf<typeof ProvenanceResult_T>;
