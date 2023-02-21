import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { Eq, struct } from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
import { Ord, contramap } from "fp-ts/Ord";
import { Eq as eqString } from "fp-ts/string";

import { ordTau } from "../../../fhir-resources/utils/tau";
import { BSupportedResource } from "../../../fhir-resources/base/resource";
import { IssueList_A, ctx, err, msg, warn } from "../../../utils/issues";
import { BoxedObservation,  FHIR_Observation_T } from "../../../fhir-resources/diagnostics/observation";
import { FHIR_Coding_A, FHIR_Identifier_A, FHIR_Quantity_A, FHIR_dateTime_A } from "../../../fhir-resources/types";

import { UnitValue_A } from "../defs";


function effectiveObs (obs: BoxedObservation): O.Option<FHIR_dateTime_A> {
    switch (obs.boxed._effectiveTag) {
        case "effectiveDateTime":
            return O.fromNullable(obs.boxed.effectiveDateTime);
    }

    return O.none;
}

const byEffective: Ord<BoxedObservation> = contramap(effectiveObs)(O.getOrd(ordTau));

const getMostRecentObservation = (name: string, codings: FHIR_Coding_A[]):
    (resources: BSupportedResource[]) => E.Either<IssueList_A, BoxedObservation> =>
    resources => pipe(resources,
        A.filter(bres => FHIR_Observation_T.is(bres.boxed)),
        A.filter(forCode(codings)),
        A.sort(byEffective),

        arr => arr.length === 0
            ? E.left([ warn({ ...msg(`no ${name} Observation resource found`) }) ])
            : E.right(arr[arr.length - 1])
    );

export const getObservationValueQuantity = (name: string, codings: FHIR_Coding_A[]):
    (resources: BSupportedResource[]) => E.Either<IssueList_A, { quantity: UnitValue_A, resourceId: string, resourceIdentifier: O.Option<FHIR_Identifier_A[]> }> => resources => {

    const bobs = getMostRecentObservation(name, codings)(resources);
    if (E.isLeft(bobs)) {
        return bobs;
    }

    if (bobs.right.boxed._valueTag !== "valueQuantity") {
        return E.left([ err({ ...msg(`only valueQuantity supported for ${name} for now`) }) ]);
    }

    const qty = quantityToValueUnit(bobs.right.boxed.valueQuantity);
    if (E.isLeft(qty)) {
        return qty;
    }

    return E.right({
        quantity:           qty.right,
        resourceId:         bobs.right.boxed.id,
        resourceIdentifier: O.fromNullable(bobs.right.boxed.identifier)
    });
};

export const getObservationValueCodeableConceptFirstCoding = (name: string, codings: FHIR_Coding_A[]):
    (resources: BSupportedResource[]) => E.Either<IssueList_A, { coding: FHIR_Coding_A, resourceId: string, resourceIdentifier: O.Option<FHIR_Identifier_A[]> }> => resources => {

    const bobs = getMostRecentObservation(name, codings)(resources);
    if (E.isLeft(bobs)) {
        return bobs;
    }

    if (O.isNone(bobs.right.valueCodeableConcept)) {
        return E.left([ err({ ...msg("no resolved codeableConcept value at observation") }) ]);
    }

    if (bobs.right.boxed._valueTag === "valueCodeableConcept") {
        if (typeof bobs.right.boxed.valueCodeableConcept.coding === "undefined") {
            return E.left([ err({ ...msg("codeableConcept value has no codings array") }) ]);
        }
        if (bobs.right.boxed.valueCodeableConcept.coding.length === 0) {
            return E.left([ err({ ...msg("codeableConcept value has no codings") }) ]);
        }

        return E.right({
            coding: {
                display: bobs.right.valueCodeableConcept.value,
                system:  bobs.right.boxed.valueCodeableConcept.coding[0].system,
                code:    bobs.right.boxed.valueCodeableConcept.coding[0].code
            },
            resourceId:         bobs.right.boxed.id,
            resourceIdentifier: O.fromNullable(bobs.right.boxed.identifier)
        });
    }

    return E.left([ err({ ...msg("no codeableConcept value at observation") }) ]);
};

export const getObservationValueString = (name: string, codings: FHIR_Coding_A[]):
    (resources: BSupportedResource[]) => E.Either<IssueList_A, { value: string, resourceId: string, resourceIdentifier: O.Option<FHIR_Identifier_A[]> }> => resources => {

    const bobs = getMostRecentObservation(name, codings)(resources);
    if (E.isLeft(bobs)) {
        return bobs;
    }

    if (bobs.right.boxed._valueTag !== "valueString") {
        return E.left([ err({ ...msg(`only valueString supported for ${name} for now`) }) ]);
    }

    return E.right({
        value:              bobs.right.boxed.valueString,
        resourceId:         bobs.right.boxed.id,
        resourceIdentifier: O.fromNullable(bobs.right.boxed.identifier)
    });
};

const eqCoding: Eq<FHIR_Coding_A> = struct({
    system: eqString,
    code:   eqString
});

const forCode = (codings: FHIR_Coding_A[]): (observation: BoxedObservation) => boolean => observation => {
    if (typeof observation.boxed.code === "undefined") {
        return false;
    }
    return A.intersection(eqCoding)(codings)(observation.boxed.code.coding).length > 0;
};

function quantityToValueUnit (qty: FHIR_Quantity_A): E.Either<IssueList_A, UnitValue_A> {
    if (typeof qty.value === "undefined" || typeof qty.unit === "undefined") {
        return E.left([ err({ ...msg("Quantity is incomplete"), ...ctx({ quantity: qty }) }) ]);
    }

    return E.right({
        value: qty.value,
        unit:  qty.unit
    });
}
