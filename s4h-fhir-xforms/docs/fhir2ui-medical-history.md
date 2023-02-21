# Medical history model derivation

The derivation logic is contained in this [module](../src/transformations/medical-history/fhir2ui).

For a model to be derivable, we first need a Patient resource to start from.
The following logic determines the Patient resource:

- If there are no Patient resources in PHDP, return `undefined`.
- If there are tagged Patient resources, return the first one.
- If there are only untagged Patient resources, return the first one.

Tagging refers to putting S4H-specific FHIR tags into the `meta` property to signal that the resource was earlier written by this library (and not ingested).

Once a Patient resource is found, the values for `lastName`, `firstName`, `gender` and `dateOfBirth` are taken from it.
The remaining medical history details (blood group, rhesus factor, weight, height, occupation) are read from Observation resources.
The `code` property tells them apart (see [here](../src/transformations/medical-history/defs.ts) for the different codings).
If there are multiple observations for a given `code`, the most recent one (based on the `effective` property) is picked.

The following [test cases](../test/transformations/medical-history/fhir2ui/public-api/read-medical-history.test.ts) illustrate this.
