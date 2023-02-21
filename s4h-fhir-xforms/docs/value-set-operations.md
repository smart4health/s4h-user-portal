# Value set operations

## Overview

A value set is a subset of the union of [code systems](./codeable-concept-resolution.md).
A value set contains codings of a certain limited scope, like diagnoses, document types, practice specialties, etc.
There are multiple ways to identify a value set (by URL, by ID, by [OID](https://www.hl7.org/fhir/dstu2/extension-valueset-oid.html)).
**We identify a value set by its URL.**
A value set may also have a version and a language (that is, all texts of the codings are in that language).

From a consumer point of view, you ask the library for an object implementing the `ValueSet` interface after specifying the value set URL and optionally a version and language.

```ts
export interface ValueSet {
    lookup (params: ValueSetSourceLookupParameters): TaskEither<Issue, ValueSetLookupCoding[]>;
    search (params: ValueSetSourceSearchParameters): TaskEither<Issue, ValueSetSearchCoding[]>;
}
```

### Lookup

The `lookup` method returns the codings of the value set, ordered lexicographically by `code` (this is an arbitrary choice, but necessary to have a defined an reproduceable behavior).
The `param` argument can be used to limit the response to a maximum of codings and to skip codings.
Both together can be used to implement paging in case a dropdown list is to be filled with value set codings.
See [value-sets/defs.ts](../src/resolve-codings/value-sets/defs.ts) for more details.

### Search

The `search` method requires a search query string in the `params` argument and returns all codings whose display texts match that query.
The returned codings are ordered from most relevant to least relevant.
The returned codings may contain highlighting markers in the display texts which indicate which portions of the text did match the query.
Also, the response can be limited and skipped to allow for paging as in the `lookup` method above.
See [value-sets/defs.ts](../src/resolve-codings/value-sets/defs.ts) for more details.


## Implementations of `ValueSet `

There are multiple implementations of the interface to make the usage in the frontend as simple as possible.


### Canned value sets

Canned value sets are value set definitions that are baked into the library and are readily available without the need to reach out to an external source.
Only small value sets are shipped like this.

The function `makeCannedValueSet` in [value-sets/canned/canned.ts](../src/resolve-codings/value-sets/canned/canned.ts) takes as argument the value set URL (and, optionally, version and language) and returns an instance which will lookup and search inside value set definitions that are baked into the library.

### Memoized value sets

A memoized value set is a cache that wraps another value set and delegates method calls to it only if the result is not in the cache.
It should be used to memoize a coding service value set in order to limit network traffic.
It does not make sense to memoize a canned value set, because all its codings are already loaded.

### Sequential value sets

A sequential value set wraps one or more other value sets.
When a method is called it delegates it to the first wrapped value set.
In case of an error or an empty result, the next value set is tried.
This way one can chain together canned value sets and coding service value sets: If the value set is not found internally (canned), the coding service is consulted.

### Readymade value set

Consumers should not care about constructing sequences of value set instances together, but rather find a ready-to-use implementation that hides any resolution logic.
This is what function `makeReadymadeValueSet` is for.
It constructs the following value set:

```
sequence value set [
  canned value set,
  memoized value set [
    canned value set
  ]
]
```

When a user executes a `lookup` or `search` on it, it will first delegate to the canned value set implementation.
If it returns empty, the memoized value set is consulted.
If it does not have any value, it will reach out to the coding service (and cache the result in case there is one).

Note, `lookup` and `search` methods never fail if a value set is not found, but return an empty array.
