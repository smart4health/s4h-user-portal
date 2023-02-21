# Medications model derivation

The medications model returned by the `apiReadMedicationList` function is of type [`MedicationListResult`](../src/transformations/medications/defs.ts).
The type reflects the structure of a FHIR `MedicationStatement` resource which references a `Medication` resource.
The fields of the embedded `MedicationList` object are mapped to the UI elements as follows:

Note the way we use [AnnotatedCodeableConcepts](./codeable-concept-resolution.md#annotated-codeable-concepts).

## Medication statement list

```ts
type MedicationList = {
    modelType: "MedicationList/1",
    medicationStatements: {
        id:            string,   // MedicationStatement.id
        medicationId?: string,   // Medication.id

        period: {                 // validity interval
          min:         number,    // millisecond epoch or -Infinity, if left-open interval
          max:         number     // millisecond epoch or +Infinity, if right-open interval
        },

        dosages:       Dosage[],                  // MedicationStatement.dosage

        // embedded values from referenced Medication resource
        code:          AnnotatedCodeableConcept,  // Medication.code (Medication description)
        ingredients:   Ingredient[],              // Medication.ingredient
        form?:         AnnotatedCodeableConcept   // Medication.form
    }[]
}
```

## Medication ingredients

The `ingredients` field from the above model is mapped to the FHIR resources as follows:

```ts
type Ingredient = {
  ingredient:  AnnotatedCodeableConcept, // Medication.ingredient[i].itemCodeableConcept
  strength?:   string                    // Medication.ingredient[i].strength as human-readable string
}
```

## Dosages

The `dosages` field from the above model is mapped to the FHIR resources as follows:

```ts
type Dosage = {
  text?:             string,         // FHIR property: Dosage.text

  doseAndRate?: {                    // 1:1 mapping of the FHIR resource values (except 'unit' is resolved)
    doseQuantity?:   SimpleQuantity,
    doseRange?: {
      low?:          SimpleQuantity,
      high?:         SimpleQuantity
    }
  }[],

  timing?: {                         // 1:1 mapping of the FHIR resource values (except 'when' is resolved)
      code?:         AnnotatedCodeableConcept,
      repeat?:  {
        frequency?:  FHIR_positiveInt,

        period?:     FHIR_decimal,
        periodUnit?: enum { s, min, h, d, wk, mo, a },

        when?:       AnnotatedCodeableConcept[]
      }
  },

  // 1:1 values of the FHIR resource
  route?:            AnnotatedCodeableConcept,
  site?:             AnnotatedCodeableConcept,
  method?:           AnnotatedCodeableConcept
}

type SimpleQuantity = {
  value?: FHIR_decimal,            // SimpleQuantity.value
  unit:   AnnotatedCodeableConcept // resolved unit (using normal codeable concept resolution logic)
}
```

## Examples

Examples can be seen in these [test cases](../test/transformations/medications/read-medications.test.ts).
