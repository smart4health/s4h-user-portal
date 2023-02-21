# Runtime FHIR resource validation

Because this library reads FHIR resources from external sources (PHDP), we must ensure their validity at runtime.
TypeScript's compile-time typings are valuable and helpful during development, but do not help us at runtime.

We use the [fp-ts](https://github.com/gcanti/fp-ts)-based library [io-ts](https://github.com/gcanti/io-ts/blob/master/index.md) for defining type class objects which give us codecs for parsing (decode) and rendering (encode) FHIR resources.
We are going to give some examples below, but this is not an io-ts tutorial.
See the following articles for more insights:

- https://gcanti.github.io/fp-ts/learning-resources/
- https://dev.to/gcanti/getting-started-with-fp-ts-setoid-39f3

## Defining a Patient

Let us sketch how the [Patient resource](https://www.hl7.org/fhir/patient.html#resource) type class is defined.
We start with a simplified example (omitting properties for brevity) and modify it to finally arrive at the [current implementation](../src/fhir-resources/individuals/patient.ts).

### Conventions

We will always define a type class object with a `_T` suffix.
From it we derive the internal `A` typing, prefixed with `_A` and an `O` typing (without suffix).
That is, for a resource `Foobar`, you will find the following definitions:

```ts
// type class
export const FHIR_Foobar_T = ...

export type FHIR_Foobar_A = t.TypeOf<  typeof FHIR_Foobar_T>; // internal typing
export type FHIR_Foobar   = t.OutputOf<typeof FHIR_Foobar_T>; // output typing
```

The latter two type declarations use TypeScript type inference magic to construct a typing that captures the type class constraints as close as it can be achieved (because not every constraint can be turned into a typing, see below).

### Later usage

Let us briefly illustrate how we will use the type class in production.

For parsing, that is, decoding an object to a Patient, we use the following:

```ts
const patient = FHIR_Patient_T.decode({ /* JSON contents of resource from PHDP or wherever */ });

if (E.isLeft(patient)) {
    console.error("decoding failed");
    console.error(patient.left); // contains validation errors
} else {
    console.log("decoding successful");
    console.log(patient.right); // patient.right has type FHIR_Patient_A
}
```

For encoding:

```ts
const patientA = { /* patient data */ };
console.log(FHIR_Patient_T.encode(patientA));
```

Decoding can fail (and return the errors in an `Either` `left`); encoding does not fail.
The goal is to put as many FHIR constraints into the type class so that a successful `decode` method invocation ensures enough "validity" of the resource to be able to work with it.

### Patient resource: first attempt: main properties

Let's sketch the Patient and start with the easy parts.

```ts
export const FHIR_Patient_T = t.intersection([
    t.type({
        resourceType: t.literal("Patient"),
        gender:       t.string,
        birthDate:    t.string
    }),

    t.partial({
        active:       t.boolean
    })
]);

export type FHIR_Patient_A = t.TypeOf<  typeof FHIR_Patient_T>;
export type FHIR_Patient   = t.OutputOf<typeof FHIR_Patient_T>;
```

First, we see a common pattern where we define the type class as a type intersection (`t.intersection`) of at least two other type classes: `t.type` and `t.partial`.
The first collects all mandatory properties, the latter all optional ones.
Let's check the properties.

- `resourceType`: This is fixed to the literal string `Patient`. Nothing else will be accepted when decoding data. This can also be nicely turned into a TypeScript type constraint. We are okay here.
- `gender`: We just said it must be a string. According to the FHIR specification, it must be from a [finite set of values](https://www.hl7.org/fhir/valueset-administrative-gender.html). We need to improve this.
- `birthDate`: Again, just a string. This is not good as the FHIR specification calls for a FHIR `date` value. We need to improve this.
- `active`: We declare it an optional Boolean and that is in line with the FHIR specification. We are okay here.


### Patient resource: Seconds attempt

Let us fix the `gender` and `birthDate` types. (We just depict the modified parts of the declaration.)

```ts
export const FHIR_Patient_T = t.intersection([
    t.type({
        ...
        gender: t.keyof({
            "male":    null,
            "female":  null,
            "other":   null,
            "unknown": null
        }),
        birthDate: FHIR_date_T
    }),
    ...
]);
```

Property `gender` is now constrained to an enum of just the given four values.
The `FHIR_date_T` is a type class defined in [primitives.ts](../src/fhir-resources/base/primitives.ts).
It is a manually implemented type class of type `t.Type<TauDate, string, unknown>`.
That is, the `A` type is `TauDate`, the `O` type is `string` and the `I` type is `unknown`.
(`I` types are always `unknown`, because they come from outside the library.)
The string `O` type makes sure an `encode`d value becomes a properly formatted FHIR `date`.
The internal `A` representation `TauDate` is a special type that captures all valid FHIR `date` formats.
See the [tau module](../src/fhir-resources/utils/tau) for more information on this.

Bottom line: `FHIR_date_T.decode` will only accept properly formatted strings that represent valid FHIR `date`s which ensures that the string for the `birthDate` property can only be a date.

The [primitives.ts](../src/fhir-resources/base/primitives.ts) module (and to some extent the [general-special-purpose.ts](../src/fhir-resources/base/general-special-purpose.ts) module) contain type classes for all required FHIR base types.

### Patient resource: Improve further

Let's add some more features to the Patient type class.

```ts
export const FHIR_Patient_T = t.intersection([
    FHIR_DomainResource_T,

    t.type({
        resourceType: t.literal("Patient"),
        name:         t.array(FHIR_HumanName_T),
        gender:       FHIR_Patient_gender_T,
        birthDate:    FHIR_date_T
    }),

    t.partial({
        identifier:           t.array(FHIR_Identifier_T),
        active:               FHIR_boolean_T,
        telecom:              t.array(FHIR_ContactPoint_T),
        address:              t.array(FHIR_Address_T),
        maritalStatus:        FHIR_CodeableConcept_T,
        photo:                t.array(FHIR_Attachment_T),
        contact:              t.array(FHIR_Patient_contact_T),
        communication:        t.array(FHIR_Patient_communication_T),
        generalPractitioner:  t.array(FHIR_Reference_T),
        managingOrganization: FHIR_Reference_T,
        link:                 t.array(FHIR_Patient_link_T)
    })
]);
```

That is quite a mouthful, but we mainly did two things:

- Add `FHIR_DomainResource_T` to model type inheritance. Now, every constraint imposed by `FHIR_DomainResource_T` is also imposed on each instance of `FHIR_Patient_T`.
- Most of the Patient-specific properties have been modeled by type classes (or arrays thereof) from [primitives.ts](../src/fhir-resources/base/primitives.ts) or [general-special-purpose.ts](../src/fhir-resources/base/general-special-purpose.ts).

### Patient resource: Final type class

Something is missing still: How about the [x] properties?
That is, how to model `deceased[x]` and `multipleBirth[x]`?
These represent mutually exclusive properties.
For example, `deceased[x]` can be a Boolean (`deceasedBoolean`) or a `dateTime` (`deceasedDateTime`).
There is no default type class constructor for such type classes in io-ts, so we built our own (see [makeTaggedUnionTypeClass](../src/utils/fp-tools.ts)).
See [patient.ts](../src/fhir-resources/individuals/patient.ts) how to define the type classes `FHIR_Patient_deceased_T` and `FHIR_Patient_multipleBirth_T`.

This allows us to arrive at the final Patient type class definition:

```ts
export const FHIR_Patient_T = t.intersection([
    FHIR_DomainResource_T,

    t.type({
        resourceType: t.literal("Patient"),
        name:         t.array(FHIR_HumanName_T),
        gender:       FHIR_Patient_gender_T,
        birthDate:    FHIR_date_T
    }),

    FHIR_Patient_deceased_T,
    FHIR_Patient_multipleBirth_T,

    t.partial({
        identifier:           t.array(FHIR_Identifier_T),
        active:               FHIR_boolean_T,
        telecom:              t.array(FHIR_ContactPoint_T),
        address:              t.array(FHIR_Address_T),
        maritalStatus:        FHIR_CodeableConcept_T,
        photo:                t.array(FHIR_Attachment_T),
        contact:              t.array(FHIR_Patient_contact_T),
        communication:        t.array(FHIR_Patient_communication_T),
        generalPractitioner:  t.array(FHIR_Reference_T),
        managingOrganization: FHIR_Reference_T,
        link:                 t.array(FHIR_Patient_link_T)
    })
]);
```

All supported FHIR resources are defined like this.

Note: We are not the first to use io-ts to craft FHIR type classes.
This [package](https://github.com/Ahryman40k/typescript-fhir-types) covers basically all FHIR 4 resources, but maintenance seems to have stopped.
Also, the [x] properties are not handled well enough.
