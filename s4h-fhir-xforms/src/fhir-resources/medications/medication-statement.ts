import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { IssueList_A, ctx, err, msg, tags, warn } from "../../utils/issues";
import { DistributiveOmit, makeTaggedUnionTypeClass } from "../../utils/fp-tools";

import { randomId } from "../utils";
import { ConceptResolver } from "../types";
import { RefGraph, RefNode } from "../utils/graph";
import { BoxedResource, Period } from "../base/boxed";
import { Tau_valueOf_ceil, Tau_valueOf_floor } from "../utils/tau";
import { FHIR_boolean_T, FHIR_dateTime_T, FHIR_string_T } from "../base/primitives";
import { AnnotatedCodeableConcept_A, FHIR_Annotation_T, FHIR_BackboneElement_T, FHIR_CodeableConcept_A, FHIR_CodeableConcept_T, FHIR_DomainResource_T, FHIR_Dosage_T, FHIR_Identifier_T, FHIR_Period_T, FHIR_Ratio_T, FHIR_Reference_T } from "../base/general-special-purpose";


export const FHIR_MedicationStatement_medication_internal_T = t.union([
    t.type({ _medicationTag: t.literal("none") }),

    t.type({ _medicationTag: t.literal("medicationReference"),       medicationReference:       FHIR_Reference_T       }, "medicationReference"       ),
    t.type({ _medicationTag: t.literal("medicationCodeableConcept"), medicationCodeableConcept: FHIR_CodeableConcept_T }, "medicationCodeableConcept" )
]);

export type FHIR_MedicationStatement_medication_internal = t.TypeOf<typeof FHIR_MedicationStatement_medication_internal_T>;

export type FHIR_MedicationStatement_medication = DistributiveOmit<FHIR_MedicationStatement_medication_internal, "_medicationTag">;

export const FHIR_MedicationStatement_medication_T = makeTaggedUnionTypeClass<
    FHIR_MedicationStatement_medication_internal,
    FHIR_MedicationStatement_medication,
    typeof FHIR_MedicationStatement_medication_internal_T>(
    FHIR_MedicationStatement_medication_internal_T, "FHIR_MedicationStatement_medication_internal_T", "_medicationTag"
);


export const FHIR_MedicationStatement_effective_internal_T = t.union([

    t.type({ _effectiveTag: t.literal("none") }),
    t.type({ _effectiveTag: t.literal("effectiveDateTime"), effectiveDateTime: FHIR_dateTime_T  }, "effectiveDateTime"),
    t.type({ _effectiveTag: t.literal("effectivePeriod"),   effectivePeriod:   FHIR_Period_T    }, "effectivePeriod"  )
]);

export type FHIR_MedicationStatement_effective_internal_A = t.TypeOf<  typeof FHIR_MedicationStatement_effective_internal_T>;
export type FHIR_MedicationStatement_effective_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_MedicationStatement_effective_internal_T>, "_effectiveTag">;

export const FHIR_MedicationStatement_effective_T = makeTaggedUnionTypeClass<
    FHIR_MedicationStatement_effective_internal_A,
    FHIR_MedicationStatement_effective_internal,
    typeof FHIR_MedicationStatement_effective_internal_T>(
    FHIR_MedicationStatement_effective_internal_T, "FHIR_MedicationStatement_effective_internal_T", "_effectiveTag"
);


export const Internal_FHIR_MedicationStatement_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("MedicationStatement"),

        status: t.keyof({
            "active":    null,
            "completed": null,
            // "entered-in-error": null, // removed because not allowed by IPS
            "intended":  null,
            "stopped":   null,
            "on-hold":   null,
            "unknown":   null,
            "not-taken": null
        }),
        subject:         FHIR_Reference_T
    }),

    FHIR_MedicationStatement_medication_T,
    FHIR_MedicationStatement_effective_T,

    t.partial({
        identifier:        t.array(FHIR_Identifier_T),
        basedOn:           t.array(FHIR_Reference_T),
        partOf:            t.array(FHIR_Reference_T),
        statusReason:      t.array(FHIR_CodeableConcept_T),
        category:          FHIR_CodeableConcept_T,
        context:           FHIR_Reference_T,
        dateAsserted:      FHIR_dateTime_T,
        informationSource: FHIR_Reference_T,
        derivedFrom:       t.array(FHIR_Reference_T),
        reasonCode:        t.array(FHIR_CodeableConcept_T),
        reasonReference:   t.array(FHIR_Reference_T),
        note:              t.array(FHIR_Annotation_T),
        dosage:            t.array(FHIR_Dosage_T)
    })
]);

type Internal_FHIR_MedicationStatement_A = t.TypeOf<  typeof Internal_FHIR_MedicationStatement_T>;
type Internal_FHIR_MedicationStatement   = t.OutputOf<typeof Internal_FHIR_MedicationStatement_T>;

export const FHIR_MedicationStatement_T = new t.Type<Internal_FHIR_MedicationStatement_A, Internal_FHIR_MedicationStatement, unknown>(
    "FHIR_MedicationStatement_T",
    Internal_FHIR_MedicationStatement_T.is,
    Internal_FHIR_MedicationStatement_T.decode,

    (obj: Internal_FHIR_MedicationStatement_A) => {
        const enc = Internal_FHIR_MedicationStatement_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_effectiveTag"];
        delete enc["_medicationTag"];
        return enc;
    }
);

export type FHIR_MedicationStatement_A = t.TypeOf<  typeof FHIR_MedicationStatement_T>;
export type FHIR_MedicationStatement   = t.OutputOf<typeof FHIR_MedicationStatement_T>;


export type BoxedMedicationStatement = BoxedResource<FHIR_MedicationStatement_A> & {
    medication:     O.Option<AnnotatedCodeableConcept_A>, // used when there is no Medication reference, but only a CodeableConcept
    category:       O.Option<string>;
    dosage: {
        site:       O.Option<AnnotatedCodeableConcept_A>,
        route:      O.Option<AnnotatedCodeableConcept_A>,
        method:     O.Option<AnnotatedCodeableConcept_A>,
        timingCode: O.Option<AnnotatedCodeableConcept_A>
    }[];
};

export function boxMedicationStatementResource (res: FHIR_MedicationStatement_A): BoxedMedicationStatement {
    return {
        boxed:  res,
        ...getPeriodFromMedicationStatement(res),

        medication: O.none,
        category: O.none,
        dosage: []
    };
}

// eslint-disable-next-line complexity
export function resolveMedicationStatementConceptTexts (resolver: ConceptResolver, res: BoxedMedicationStatement): void {
    if (res.boxed.category) {
        resolver(res.boxed.category).then(os => { res.category = os; });
    }

    if (res.boxed._medicationTag === "medicationCodeableConcept") {
        const cc = res.boxed.medicationCodeableConcept;
        resolver(cc).then(text => {
            res.medication = O.some({
                codeableConcept: cc,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(text)
            });
        });
    }

    if (res.boxed.dosage) {
        res.dosage = new Array(res.boxed.dosage.length);
        for (let i = 0; i < res.boxed.dosage.length; i++) {
            res.dosage[i] = {
                site: O.none,
                route: O.none,
                method: O.none,
                timingCode: O.none
            };

            if (res.boxed.dosage[i].site) {
                resolver(res.boxed.dosage[i].site).then(text => {
                    res.dosage[i].site = O.some({
                        codeableConcept: res.boxed.dosage[i].site,
                        // eslint-disable-next-line max-nested-callbacks
                        resolvedText: O.getOrElse(() => undefined)(text)
                    });
                });
            }

            if (res.boxed.dosage[i].route) {
                resolver(res.boxed.dosage[i].route).then(text => {
                    res.dosage[i].route = O.some({
                        codeableConcept: res.boxed.dosage[i].route,
                        // eslint-disable-next-line max-nested-callbacks
                        resolvedText: O.getOrElse(() => undefined)(text)
                    });
                });
            }

            if (res.boxed.dosage[i].method) {
                resolver(res.boxed.dosage[i].method).then(text => {
                    res.dosage[i].method = O.some({
                        codeableConcept: res.boxed.dosage[i].method,
                        // eslint-disable-next-line max-nested-callbacks
                        resolvedText: O.getOrElse(() => undefined)(text)
                    });
                });
            }

            if (res.boxed.dosage[i].timing?.code) {
                resolver(res.boxed.dosage[i].timing.code).then(text => {
                    res.dosage[i].timingCode = O.some({
                        codeableConcept: res.boxed.dosage[i].timing.code,
                        // eslint-disable-next-line max-nested-callbacks
                        resolvedText: O.getOrElse(() => undefined)(text)
                    });
                });
            }
        }
    }

}

function getPeriodFromMedicationStatement (res: FHIR_MedicationStatement_A): Period {
    switch (res._effectiveTag) {
        case "effectiveDateTime":
            return {
                period: {
                    min: Tau_valueOf_floor(res.effectiveDateTime),
                    max: Tau_valueOf_ceil( res.effectiveDateTime)
                }
            };

        case "effectivePeriod":
            return {
                period: {
                    min: res.effectivePeriod.start ? Tau_valueOf_floor(res.effectivePeriod.start) : -Infinity,
                    max: res.effectivePeriod.end   ? Tau_valueOf_ceil( res.effectivePeriod.end)   : +Infinity
                }
            };
        default: return {
            period: {
                min: -Infinity,
                max: +Infinity
            }
        };
    }
}

export function insertMedicationStatementResource (g: RefGraph, boxres: BoxedMedicationStatement): IssueList_A {
    const issues: IssueList_A = [];
    const res = boxres.boxed;

    if (res.identifier?.length > 0) {
        const n = new RefNode(res.identifier, boxres);
        const e = g.addNode(n);
        if (E.isLeft(e)) {
            return [ err({ ...msg("could not add MedicationStatement to graph"), ...ctx({ cause: e.left }), ...tags("insertMedicationStatementResource") }) ];
        }

        if (res._medicationTag === "medicationReference") {
            if (res.medicationReference.identifier) {
                g.addEdge(res.identifier[0], res.medicationReference.identifier, "medication");
            }
        }

    } else {
        const id = randomId();
        issues.push(warn({ ...msg("MedicationStatement without identifier; creating random one: " + JSON.stringify(id)), ...ctx({ resource: res }) }));

        const n = new RefNode([ id ], boxres);
        const e = g.addNode(n);
        if (E.isLeft(e)) {
            return [ err({ ...msg("could not add MedicationStatement to graph"), ...ctx({ cause: e.left }), ...tags("insertMedicationStatementResource") }) ];
        }

        if (res._medicationTag === "medicationReference") {
            if (res.medicationReference.identifier) {
                g.addEdge(id, res.medicationReference.identifier, "medication");
            }
        }
    }

    return issues;
}


export const FHIR_Medication_ingredient_item_internal_T = t.union([
    t.type({ _itemTag: t.literal("none") }),
    t.type({ _itemTag: t.literal("itemReference"),       itemReference:       FHIR_Reference_T       }, "itemReference"),
    t.type({ _itemTag: t.literal("itemCodeableConcept"), itemCodeableConcept: FHIR_CodeableConcept_T }, "itemCodeableConcept"  )
]);

export type FHIR_Medication_ingredient_item_internal_A = t.TypeOf<  typeof FHIR_Medication_ingredient_item_internal_T>;
export type FHIR_Medication_ingredient_item_internal   = DistributiveOmit<t.OutputOf<typeof FHIR_Medication_ingredient_item_internal_T>, "_itemTag">;

export const FHIR_Medication_ingredient_item_T = makeTaggedUnionTypeClass<
    FHIR_Medication_ingredient_item_internal_A,
    FHIR_Medication_ingredient_item_internal,
    typeof FHIR_Medication_ingredient_item_internal_T>(
    FHIR_Medication_ingredient_item_internal_T, "FHIR_Medication_ingredient_item_internal_T", "_itemTag"
);


export const FHIR_Medication_ingredient_T = t.intersection([
    FHIR_BackboneElement_T,

    FHIR_Medication_ingredient_item_T,

    t.partial({
        isActive: FHIR_boolean_T,
        strength: FHIR_Ratio_T
    })
]);

export const FHIR_Medication_batch_T = t.intersection([
    FHIR_BackboneElement_T,

    t.partial({
        lotNumber:      FHIR_string_T,
        expirationDate: FHIR_dateTime_T
    })
]);

export const Internal_FHIR_Medication_T = t.intersection([
    FHIR_DomainResource_T,

    t.type({
        resourceType: t.literal("Medication"),
        code:         FHIR_CodeableConcept_T
    }),

    t.partial({
        identifier:   t.array(FHIR_Identifier_T),
        status: t.keyof({
            "active": null,
            "inactive": null,
            "entered-in-error": null
        }),
        manufacturer: FHIR_Reference_T,
        form:         FHIR_CodeableConcept_T,
        amount:       FHIR_Ratio_T,
        ingredient:   t.array(FHIR_Medication_ingredient_T),
        batch:        FHIR_Medication_batch_T

    })
]);

type Internal_FHIR_Medication_A = t.TypeOf<  typeof Internal_FHIR_Medication_T>;
type Internal_FHIR_Medication   = t.OutputOf<typeof Internal_FHIR_Medication_T>;

export const FHIR_Medication_T = new t.Type<Internal_FHIR_Medication_A, Internal_FHIR_Medication, unknown>(
    "FHIR_Medication_T",
    Internal_FHIR_Medication_T.is,
    Internal_FHIR_Medication_T.decode,

    (obj: Internal_FHIR_Medication_A) => {
        const enc = Internal_FHIR_Medication_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        return enc;
    }
);

export type FHIR_Medication_A = t.TypeOf<  typeof FHIR_Medication_T>;
export type FHIR_Medication   = t.OutputOf<typeof FHIR_Medication_T>;


export type BoxedMedication = BoxedResource<FHIR_Medication_A> & {
    code:        O.Option<AnnotatedCodeableConcept_A>;
    form:        O.Option<AnnotatedCodeableConcept_A>;
    ingredients: O.Option<AnnotatedCodeableConcept_A>[];
};


export function boxMedicationResource (res: FHIR_Medication_A): BoxedMedication {
    return {
        boxed:  res,
        period: { min: -Infinity, max: +Infinity },

        code: O.none,
        form: O.none,
        ingredients: []
    };
}

export function resolveMedicationConceptTexts (resolver: ConceptResolver, res: BoxedMedication): void {
    if (res.boxed.code) {
        resolver(res.boxed.code).then(os => {
            res.code = O.some({
                codeableConcept: res.boxed.code,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(os)
            });
        });
    }

    if (res.boxed.form) {
        resolver(res.boxed.form).then(os => {
            res.form = O.some({
                codeableConcept: res.boxed.form,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText: O.getOrElse(() => undefined)(os)
            });
        });
    }

    if (res.boxed.ingredient) {
        Promise.all(pipe(res.boxed.ingredient,
            A.filter(ing => ing._itemTag === "itemCodeableConcept"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            A.map(ing => (ing as any).itemCodeableConcept as FHIR_CodeableConcept_A),
            A.map(resolver))
        ).then(texts => {
            for (let i = 0; i < texts.length; i++) {
                const text = texts[i];
                if (O.isSome(text)) {
                    const ingItem = res.boxed.ingredient[i];
                    if (ingItem._itemTag === "itemCodeableConcept") {
                        res.ingredients.push(O.some({
                            codeableConcept: ingItem.itemCodeableConcept,
                            resolvedText:    text.value
                        }));
                    } else {
                        res.ingredients.push(O.none);
                    }
                } else {
                    const ingItem = res.boxed.ingredient[i];
                    if (ingItem._itemTag === "itemCodeableConcept") {
                        res.ingredients.push(O.some({
                            codeableConcept: ingItem.itemCodeableConcept
                        }));
                    } else {
                        res.ingredients.push(O.none);
                    }
                }
            }
        });
    }
}


export function insertMedicationResource (g: RefGraph, boxres: BoxedMedication): IssueList_A {
    const issues: IssueList_A = [];
    const res = boxres.boxed;

    if (res.identifier?.length > 0) {
        const n = new RefNode(res.identifier, boxres);
        const e = g.addNode(n);
        if (E.isLeft(e)) {
            return [ err({ ...msg("could not add Medication to graph"), ...ctx({ cause: e.left }), ...tags("insertMedicationResource") }) ];
        }

    } else {
        issues.push(warn({ ...msg("Medication resource without identifier"), ...ctx({ resource: res }) }));
    }

    return issues;
}
