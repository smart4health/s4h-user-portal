import * as t from "io-ts";
import * as O from "fp-ts/Option";

import { DistributiveOmit, makeTaggedUnionTypeClass } from "../../utils/fp-tools";

import { FHIR_code_T, FHIR_dateTime_T, FHIR_instant_T, FHIR_uri_T } from "../base/primitives";
import { AnnotatedCodeableConcept_A, FHIR_CodeableConcept_T, FHIR_DomainResource_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Reference_A, FHIR_Reference_T, FHIR_Signature_T } from "../base/general-special-purpose";
import { BoxedResource } from "../base/boxed";
import { ConceptResolver } from "../types";


export const FHIR_Provenance_occurred_internal_T = t.union([

    t.type({ _occurredTag: t.literal("none") }),
    t.type({ _occurredTag: t.literal("occurredDateTime"), occurredDateTime: FHIR_dateTime_T  }, "occurredDateTime"),
    t.type({ _occurredTag: t.literal("occurredPeriod"),   occurredPeriod:   FHIR_Period_T    }, "occurredPeriod"  )
]);

export type FHIR_Provenance_occurred_internal_A = t.TypeOf<  typeof FHIR_Provenance_occurred_internal_T>;
export type FHIR_Provenance_occurred_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_Provenance_occurred_internal_T>, "_occurredTag">;

export const FHIR_Provenance_occurred_T = makeTaggedUnionTypeClass<
    FHIR_Provenance_occurred_internal_A,
    FHIR_Provenance_occurred_internal,
    typeof FHIR_Provenance_occurred_internal_T>(
    FHIR_Provenance_occurred_internal_T, "FHIR_Provenance_occurred_internal_T", "_occurredTag"
);


export const FHIR_Provenance_Agent_T = t.intersection([
    t.type({
        who:        FHIR_Reference_T
    }),
    t.partial({
        type:       FHIR_CodeableConcept_T,
        role:       t.array(FHIR_CodeableConcept_T),
        onBehalfOf: FHIR_Reference_T
    })
]);

export const FHIR_Provenance_Entity_T = t.intersection([
    t.type({
        role:  FHIR_code_T,
        what:  FHIR_Reference_T
    }),
    t.partial({
        agent: t.array(FHIR_Provenance_Agent_T)
    })
]);


export const Internal_FHIR_Provenance_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Provenance"),

        target:       t.array(FHIR_Reference_T),
        recorded:     FHIR_instant_T,
        agent:        t.array(FHIR_Provenance_Agent_T)
    }),

    FHIR_Provenance_occurred_T,

    t.partial({
        policy:    t.array(FHIR_uri_T),
        location:  FHIR_Reference_T,
        reason:    t.array(FHIR_CodeableConcept_T),
        activity:  FHIR_CodeableConcept_T,
        entity:    t.array(FHIR_Provenance_Entity_T),
        signature: t.array(FHIR_Signature_T),

        identifier: t.array(FHIR_Identifier_T) // not defined by FHIR but quick fix to calm the type checker
    })
]);

type Internal_FHIR_Provenance_A = t.TypeOf<  typeof Internal_FHIR_Provenance_T>;
type Internal_FHIR_Provenance   = t.OutputOf<typeof Internal_FHIR_Provenance_T>;

export const FHIR_Provenance_T = new t.Type<Internal_FHIR_Provenance_A, Internal_FHIR_Provenance, unknown>(
    "FHIR_Provenance_T",
    Internal_FHIR_Provenance_T.is,
    Internal_FHIR_Provenance_T.decode,

    (obj: Internal_FHIR_Provenance_A) => {
        const enc = Internal_FHIR_Provenance_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_occurredTag"];
        return enc;
    }
);

export type FHIR_Provenance_A = t.TypeOf<  typeof FHIR_Provenance_T>;
export type FHIR_Provenance   = t.OutputOf<typeof FHIR_Provenance_T>;


export type ProvenanceAgent = {
    who:  FHIR_Reference_A,
    type: O.Option<AnnotatedCodeableConcept_A>
}

export type BoxedProvenance = BoxedResource<FHIR_Provenance_A> & {
    activity: O.Option<AnnotatedCodeableConcept_A>;
    agents:   ProvenanceAgent[];
};

export function boxProvenanceResource (res: FHIR_Provenance_A): BoxedProvenance {
    return {
        boxed: res,
        period: {
            min: -Infinity,
            max: +Infinity
        },
        activity: O.none,
        agents: []
    };
}

export function resolveProvenanceConceptTexts (resolver: ConceptResolver, res: BoxedProvenance): void {
    if (res.boxed.activity) {
        resolver(res.boxed.activity).then(os => {
            res.activity = O.some({
                codeableConcept: res.boxed.activity,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(os)
            });
        });
    }

    if (res.boxed.agent) {
        res.agents = new Array(res.boxed.agent.length);
        const work: Promise<O.Option<string>>[] = [];

        for (let i = 0; i < res.boxed.agent.length; i++) {
            res.agents[i] = {
                who:  res.boxed.agent[i].who,
                type: O.none // set later (*), if present
            };

            if (typeof res.boxed.agent[i].type !== "undefined") {
                work.push(resolver(res.boxed.agent[i].type));
            } else {
                work.push(Promise.resolve(O.none));
            }
        }

        Promise.all(work).then(agentTypes => {
            for (let i = 0; i < agentTypes.length; i++) {
                const type = agentTypes[i];
                if (O.isSome(type)) {
                    res.agents[i].type = O.some({  // (*)
                        codeableConcept: res.boxed.agent[i].type,
                        resolvedText:    type.value
                    });
                }
            }
        });
    }
}
