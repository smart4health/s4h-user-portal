# Design decisions

The library is structured in four major modules:

- `fhir-resources` contains codecs for runtime FHIR resource validation and other FHIR utils.
- `resolve-codings` contains resolution logic for codings of code systems and value sets.
- `transformations` contains code that turns FHIR resources into UI models (model reader, FHIR2UI) and UI models into FHIR resources (model writer, UI2FHIR).
- `utils` contains all sorts of utility functions used across the other modules.

There are no cyclic dependencies among those high-level modules.
The following assumptions are made for this documentation (meaning we do not discuss or introduce the following topics):

- You know [TypeScript](https://www.typescriptlang.org/).
- You know about [FHIR resources](https://www.hl7.org/fhir/modules.html).

## API design

All exported functions start with `api` and are pure functional, that is, the output is solely dependent on the inputs.
There is no hidden or mutable state.
The implementation follows in parts [functional programming](https://en.wikipedia.org/wiki/Functional_programming) paradigms.
The TypeScript library [fp-ts](https://github.com/gcanti/fp-ts) is used to facilitate the programming.
The following articles are worth reading if you are unfamiliar with the topic:

- https://gcanti.github.io/fp-ts/learning-resources/
- https://dev.to/gcanti/getting-started-with-fp-ts-setoid-39f3

Only a small subset of features of fp-ts are used.
These include `Option` types, `Either` types, `Task`s, `Array`s and `pipe`d data flows; study these and you should be good.

For [runtime FHIR validation](./fhir-validation.md) and compile-time typings derivation, we use the library [io-ts](https://github.com/gcanti/io-ts/blob/master/index.md) (which is based on fp-ts itself).
The following articles are worth reading to get up to speed:

- https://github.com/Ahryman40k/typescript-fhir-types
- https://medium.com/@ahryman40k/handle-fhir-objects-in-typescript-and-javascript-7110f5a0686f

We occasionally use the notion of the io-ts `A`, `O` and `I` types in the remainder of the document.
To see this in action, see [issues.ts](../src/utils/issues.ts), [general-special-purpose.ts](../src/fhir-resources/base/general-special-purpose.ts) or [primitives.ts](../src/fhir-resources/base/primitives.ts).

Most of the exported API functions follow these conventions:

- They are asynchronous, that is, they return a promise.
- The promise returns a tuple (that is an array of length two).
  - The first component is an issue list (see below).
  - The second component is the result or `undefined`.
    - If the result is `undefined`, the issue list will contain at least one error.
- The promise should never reject. If it does, please report a bug.
- The arguments and return types are `O` types.

Each such API function is typically complemented with an internal counterpart which follows these conventions:

- All types from now on are `A` types.
- They are fp-ts `Task`s which return an `Either` type (that is, they are `EitherTask`s).
  - The `Either` `left` value is an issue list which describes the error conditions.
  - The `Either` `right` value is a tuple.
    - The first component is an issue list which may contain non-error issues worth reporting to the user.
    - The second component is the actual result (it cannot be `undefined`).

Most internal helper functions also follow these rules.

That it, the exported `api`-prefixed functions essentially to the following:

- Validate and parse the `I` arguments to `A` values.
- Call the internal counterpart `Task` functions.
- Transform `Either` results as follows:
  - If `right`: return the `right` value, after having rendered all `A` types to `O` types.
  - If `left`:  return the issue list (`O` converted) with the result set to `undefined`.

This decoupling is done because the UI development team does not want to use the fp-ts library.

## Issues and errors

Apart from hard errors there are many situations to return additional information on the FHIR transformation process.
We use issues of different severities to represent errors, warnings or infos.
The type is defined in [issues.ts](../src/utils/issues.ts) and looks like so in pseudocode (note, it is defined via io-ts):

```
type Issue {
  // mandatory
  severity: "info" | "warning" | "error"
  message:   string

  // optional
  context?: object
  name?:    string
  tags?:    string[]
}
```

An issue that prevents a valid return is an `"error"`.
The other two severities are less strictly separated.
The `message` is understood to be developer English and not fit for display to the user.
The `context` object may contain more detailed info on the issue (like validation errors).
The `name` string can be used as an error code to check at runtime whether a certain issue ocurred (this is, however, not widely used so far).
The tags can be used to annotate the issue with further information (like the transformation stage in which an error occurred).
Note, the `O` version of the `tags` property is a string array while the internal `A` version is a record.
