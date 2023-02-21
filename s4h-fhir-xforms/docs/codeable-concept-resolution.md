# Coding resolution and codeable concept resolution

## Coding resolution

Resolving a coding means to return a human-readable string for it.
A code system is a set of `LanguageCoding`s.
A `LanguageCoding` is a quadrupel of the following format:

```ts
type LanguageCoding = {
    system:   string;
    code:     string;
    language: string;
    display:  string;
}
```

A `CodeSystems` instance encapsulates one or more (hence the plural in the name) code systems and exposes one function:

```ts
resolveCodings (codings: FHIR_Coding[], language: Option<string>): Promise<Either<IssueList, ResolvedCoding>[]>;
```

It accepts an array of `FHIR_Coding`s and returns an array of th exact same length, that is, the elements correspond to each other.
If a coding could be resolved to a human-readable string (again, that is, it was found in one of the encapsulated coding systems) the corresponding item in the returned array is an `Either.right` of `ResolvedCoding` with the following structure:

```ts
type ResolvedCoding = {
    language:        string;
    version:         string;
    resolvedDisplay: string;
}
```

If the coding resolution fails, the corresponding return array item is an `Either.left` of an `IssueList` detailing what went wrong for that particular coding.

The coding resolution logic is applied independently for each coding in the above array and should follow the following rules (we use "should" here because the concrete `CodeSystems` implementation might reach out to an external service whose resolution logic we do not control):

----
- if (`language` is `some`):
  - if (code system contains coding `c` with matching `system`, `code` and `language`):
    - return `c`
  - else:
    - return error
- else:
  - `matchingCodings` = all codings matching `system` and `code`
  - if (`matchingCodings` contains coding `c` with default language):
    - return `c`
  - else:
    - return `matchingCodings[0]`
----

See the following test cases for illustration: [canned.test.ts](../test/resolve-codings/code-systems/canned.test.ts)


## Concept resolution

A [CodeableConcept](https://www.hl7.org/fhir/datatypes.html#codeableconcept) describes a certain categorical concept like an encounter type, diagnosis, medication ingredient, etc.
It can be defined by a set of codings which are understood to be equivalent (synonyms) of the single concept (rather than a set-valued concept).
That is, a concept representing a diagnosis might contain codings of the same diagnosis in different code systems (like SNOMED, ICD-10).
A codeable concept looks as follows (at least one of the two properties must be present):

```ts
type CodeableConcept = {
    coding?: FHIR_Coding[];
    text?:   string;
}
```

Turning a `CodeableConcept` into a human-readable string can be done using multiple rules.
The following rule is supported by the library.
Note, that we use `codings` (plural) in the next pseudo-code to stress that this property is an array; in the wild, this will be called `coding` (but still be an array).

----
- input: codeable concept `CC`
- if `CC.codings` is undefined:
  - if `CC.text` is undefined:
    - return undefined (`CC` is invalid)
  - else:
    - return `CC.text`
- else: // `CC.codings` is defined:
  - if `CC.codings` is not an array:
    - return undefined (invalid concept, issue a warning, ignore potential `text` property)
  - if `CC.codings` is empty:
    - return undefined (invalid concept, issue a warning, ignore potential `text` property)

  - `possiblyResolvedCodings` := try to resolve `CC.codings` as described [above](#coding-resolution)
  - if resolution of all codings in `CC.codings` failed, that is, no entry of `possiblyResolvedCodings` contains a value for `resolvedDisplay`:
    - if `CC.text` is defined:
      - return `CC.text`
    - else:
      - `codingsWithOriginalDisplay` := subset of `CC.codings` where `originalDisplay` is defined
      - if `codingsWithOriginalDisplay` is empty:
        - return undefined
      - `userSelectedOriginalDisplay` := subset of `codingsWithOriginalDisplay` with `userSelected` == true
      - if `userSelectedOriginalDisplay` not empty:
        - return `strategy(userSelectedOriginalDisplay)`

      - return `strategy(codingsWithOriginalDisplay)`
  - else: // there is at least one successfully resolved coding in `possiblyResolvedCodings`
    - `userSelectedResolvedDisplay` := subset of `possiblyResolvedCodings` with defined `resolvedDisplay` and `userSelected` == true
    - if `userSelectedResolvedDisplay` not empty:
      - return `strategy(userSelectedResolvedDisplay)`
    - `resolvedDisplay` := subset of `possiblyResolvedCodings` with defined `resolvedDisplay`
    - return `strategy(resolvedDisplay)`
----

See the following test cases for illustration: [concept-resolution.test.ts](../test/resolve-codings/concept-resolution.test.ts)

### Merge strategy functions

#### `joinMerger`

```ts
export const joinMerger = (sep: string): TextMergeStrategy => (texts) => { ... };
```

This function returns a merge strategy which just joins the strings with separator `sep`.

#### `pickFirstMerger`

```ts
export const pickFirstMerger: TextMergeStrategy = (texts) => { ... };
```

This function returns the first array entry or the empty string if the array is empty.

### Annotated codeable concepts

When returning a resolved codeable concept to the UI, we often return not only the human-readable string, but also the original codeable concept.
This is done so that model changes constructed in the UI can be turned into changes of PHDP data.
If the user changes an attribute that is represented as a codeable concept, the UI can construct a new such concept containing only one coding (e.g., the one the user selected from a dropdown list).
If there are other unmodified attributes that are of type codeable concept, however, we need the original codeable concept to craft a full resource.The UI does not need to determine the delta of changes, it just sends all data to the FHIR library and it will sort things out.

An `AnnotatedCodeableConcept` looks like this:

```ts
type AnnotatedCodeableConcept = {
  codeableConcept: FHIR_CodeableConcept,
  resolvedText?:   string
}
```

For pure data display purposes, you can ignore the `codeableConcept` field and just show the `resolvedText` (if defined).
