import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

import { IssueList_A, ctx, err, msg, tags, warn } from "../../utils/issues";

import { ConceptResolver } from "../types";
import { RefGraph, RefNode } from "../utils/graph";
import { BoxedResource, Period } from "../base/boxed";
import { FHIR_code_T, FHIR_positiveInt_T } from "../base/primitives";
import { FHIR_CodeableConcept_T, FHIR_Coding_T, FHIR_DomainResource_T, FHIR_Duration_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Reference_T } from "../base/general-special-purpose";


export const FHIR_Encounter_statusHistory_T = t.type({
    status: FHIR_code_T,
    period: FHIR_Period_T
});

export const FHIR_Encounter_classHistory_T = t.type({
    class: FHIR_Coding_T,
    period: FHIR_Period_T
});

export const FHIR_Encounter_participant_T = t.partial({
    type:       t.array(FHIR_CodeableConcept_T),
    period:     FHIR_Period_T,
    individual: FHIR_Reference_T
});

export const FHIR_Encounter_diagnosis_T = t.intersection([
    t.type({
        condition: FHIR_Reference_T
    }),
    t.partial({
        use:       FHIR_CodeableConcept_T,
        rank:      FHIR_positiveInt_T
    })
]);

export const T_Encounter_hospitalization_T = t.partial({
    preAdministrationIdentifier: FHIR_Identifier_T,
    origin:                      FHIR_Reference_T,
    admitSource:                 FHIR_CodeableConcept_T,
    reAdmission:                 FHIR_CodeableConcept_T,
    dietPreference:              t.array(FHIR_CodeableConcept_T),
    specialCourtesy:             t.array(FHIR_CodeableConcept_T),
    specialArrangement:          t.array(FHIR_CodeableConcept_T),
    destination:                 FHIR_Reference_T,
    dischargeDisposition:        FHIR_CodeableConcept_T
});

export const FHIR_Encounter_location_T = t.intersection([
    t.type({
        location: FHIR_Reference_T
    }),
    t.partial({
        status:       FHIR_code_T,
        physicalType: FHIR_CodeableConcept_T,
        period:       FHIR_Period_T
    })
]);

export const Internal_FHIR_Encounter_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Encounter"),

        identifier:   t.array(FHIR_Identifier_T),
        status: t.keyof({
            "planned":          null,
            "arrived":          null,
            "triaged":          null,
            "in-progress":      null,
            "onleave":          null,
            "finished":         null,
            "cancelled":        null,
            "entered-in-error": null,
            "unknown":          null
        }),
        class:      FHIR_Coding_T
    }),
    t.partial({
        statusHistory:   t.array(FHIR_Encounter_statusHistory_T),
        classHistory:    t.array(FHIR_Encounter_classHistory_T),
        type:            t.array(FHIR_CodeableConcept_T),
        serviceType:     FHIR_CodeableConcept_T,
        priority:        FHIR_CodeableConcept_T,
        subject:         FHIR_Reference_T,
        episodeOfCare:   t.array(FHIR_Reference_T),
        basedOn:         t.array(FHIR_Reference_T),
        participant:     t.array(FHIR_Encounter_participant_T),
        appointment:     t.array(FHIR_Reference_T),
        period:          FHIR_Period_T,
        length:          FHIR_Duration_T,
        reasonCode:      t.array(FHIR_CodeableConcept_T),
        reasonReference: t.array(FHIR_Reference_T),
        diagnosis:       t.array(FHIR_Encounter_diagnosis_T),
        account:         FHIR_Reference_T,
        hospitalization: T_Encounter_hospitalization_T,
        location:        FHIR_Encounter_location_T,
        serviceProvider: FHIR_Reference_T,
        partOf:          FHIR_Reference_T
    })
]);

type Internal_FHIR_Encounter_A = t.TypeOf<  typeof Internal_FHIR_Encounter_T>;
type Internal_FHIR_Encounter   = t.OutputOf<typeof Internal_FHIR_Encounter_T>;

export const FHIR_Encounter_T = new t.Type<Internal_FHIR_Encounter_A, Internal_FHIR_Encounter, unknown>(
    "FHIR_Encounter_T",
    Internal_FHIR_Encounter_T.is,
    Internal_FHIR_Encounter_T.decode,

    (obj: Internal_FHIR_Encounter_A) => {
        const enc = Internal_FHIR_Encounter_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_effectiveTag"];
        delete enc["_valueTag"];
        return enc;
    }
);

export type FHIR_Encounter_A = t.TypeOf<  typeof FHIR_Encounter_T>;
export type FHIR_Encounter   = t.OutputOf<typeof FHIR_Encounter_T>;



export type BoxedEncounter = BoxedResource<FHIR_Encounter_A> & {
    type:  O.Option<string>[];
};

export function insertEncounterResource (g: RefGraph, boxres: BoxedEncounter): IssueList_A {
    const issues: IssueList_A = [];
    const res = boxres.boxed;

    if (res.identifier?.length > 0) {
        const n = new RefNode(res.identifier, boxres);
        const e = g.addNode(n);
        if (E.isLeft(e)) {
            return [ err({ ...msg("could not add Encounter to graph"), ...ctx({ cause: e.left }), ...tags("insertEncounterResource") }) ];
        }

        if (res.partOf?.identifier) {
            g.addEdge(res.identifier[0], res.partOf.identifier, "partOf");
        }

    } else {
        issues.push(warn({ ...msg("Encounter without identifier"), ...ctx({ resource: res }) }));
    }

    return issues;
}

export function boxEncounterResource (res: FHIR_Encounter_A): BoxedEncounter {
    return {
        boxed:  res,
        ...getPeriodFromEncounter(res),

        type:   []
    };
}

export function resolveEncounterConceptTexts (resolver: ConceptResolver, res: BoxedEncounter): void {
    if (res.boxed.type) {
        Promise.all(A.map(resolver)(res.boxed.type))
            .then(texts => { res.type = texts; });
    }
}

function getPeriodFromEncounter (_res: FHIR_Encounter_A): Period {
    // Change this when actual intervals are needed.
    return {
        period: {
            min: -Infinity,
            max: +Infinity
        }
    };
}
