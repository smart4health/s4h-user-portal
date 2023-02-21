import * as t from "io-ts";

import { Period_T } from "../../fhir-resources/base/boxed";
import { AnnotatedCodeableConcept_T, FHIR_Identifier_T, FHIR_decimal_T, FHIR_positiveInt_T } from "../../fhir-resources/types";


export const Ingredient_T = t.intersection([
    t.type({
        ingredient: AnnotatedCodeableConcept_T
    }),
    t.partial({
        strength:   t.string
    })
]);

export type Ingredient_A = t.TypeOf<  typeof Ingredient_T>;
export type Ingredient   = t.OutputOf<typeof Ingredient_T>;

export const Timing_Repeat_T = t.partial({
    frequency:    FHIR_positiveInt_T,

    period:       FHIR_decimal_T,
    periodUnit:   AnnotatedCodeableConcept_T,

    when:         t.array(AnnotatedCodeableConcept_T)
});

export type Timing_Repeat_A = t.TypeOf<  typeof Timing_Repeat_T>;
export type Timing_Repeat   = t.OutputOf<typeof Timing_Repeat_T>;


export const SimpleQuantity_T = t.intersection([
    t.partial({
        value: FHIR_decimal_T
    }),
    t.type({
        unit: AnnotatedCodeableConcept_T
    })
]);

export type SimpleQuantity_A = t.TypeOf<  typeof SimpleQuantity_T>;
export type SimpleQuantity   = t.OutputOf<typeof SimpleQuantity_T>;


export const Dosage_doseAndRate_T = t.partial({
    doseQuantity: SimpleQuantity_T,
    doseRange: t.partial({
        low:  SimpleQuantity_T,
        high: SimpleQuantity_T
    })
});

export type Dosage_doseAndRate_A = t.TypeOf<  typeof Dosage_doseAndRate_T>;
export type Dosage_doseAndRate   = t.OutputOf<typeof Dosage_doseAndRate_T>;


export const Dosage_T = t.partial({
        text:        t.string,

        // FHIR has a `doseAndRate` field; we only support `dose` for now here.
        doseAndRate: t.array(Dosage_doseAndRate_T),

        timing: t.partial({
            code:    AnnotatedCodeableConcept_T,
            repeat:  Timing_Repeat_T
        }),

        route:       AnnotatedCodeableConcept_T,
        site:        AnnotatedCodeableConcept_T,
        method:      AnnotatedCodeableConcept_T
});

export type Dosage_A = t.TypeOf<  typeof Dosage_T>;
export type Dosage   = t.OutputOf<typeof Dosage_T>;


export const MedicationStatement_T = t.intersection([
    Period_T,
    t.type({
        medicationStatementId:          t.string,

        code:        AnnotatedCodeableConcept_T, // Medication description
        dosages:     t.array(Dosage_T)
    }),
    t.partial({
        ingredients:  t.array(Ingredient_T),

        medicationId:                  t.string,
        medicationIdentifier:          t.array(FHIR_Identifier_T),
        medicationStatementIdentifier: t.array(FHIR_Identifier_T),

        form:         AnnotatedCodeableConcept_T // Medication form
    })
]);

export type MedicationStatement_A = t.TypeOf<  typeof MedicationStatement_T>;
export type MedicationStatement   = t.OutputOf<typeof MedicationStatement_T>;


export const MedicationList_T = t.type({
    modelType: t.literal("MedicationList/1"),
    medicationStatements: t.array(MedicationStatement_T)

});

export type MedicationList_A = t.TypeOf<  typeof MedicationList_T>;
export type MedicationList   = t.OutputOf<typeof MedicationList_T>;


export const MedicationListResult_T = t.intersection([
    t.type({
        model: MedicationList_T
    }),
    t.partial({
        lastCreated: t.number,
        lastUpdated: t.number,
        dot:         t.string
    })
]);

export type MedicationListResult_A = t.TypeOf<  typeof MedicationListResult_T>;
export type MedicationListResult   = t.OutputOf<typeof MedicationListResult_T>;
