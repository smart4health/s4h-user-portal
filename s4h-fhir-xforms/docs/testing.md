# Testing

## Debug recipe

If you need to test exported API functionality against a given set of FHIR resources, there are two options:

### Testing the internal functions directly

This is illustrated in the [debug recipe](../test/api/debug-example.test.ts).
You need to feed an array of (unparsed) FHIR resources into the function and assert on the return values.
This is easiest for model reader functionality.

### Testing the external API functions

For model writer functionality, we need some sort of state which mimics the PHDP.
There are mocked SDK variants in [here](../test/sdk-mocks.ts).
The is no dedicated recipe yet, but the [write-medical-history](../test/transformations/medical-history/ui2fhir/public-api/write-medical-history.test.ts) illustrates the principle.

## Dumping and Dotting

The test code is executed in a (possibly headless) browser instance of your choosing (default is a headless Chrome).
You can set the environment variable `DUMP` to 1 and check for it using the function `shouldDump`.
This way you can control the amount of output.
Note, not all output is fed back to the command line.
See the browser console for details.

The [group list derivation](./fhir2ui-group-list.md) uses an intermediate graph representation to link FHIR resources.
For debugging it can be useful to render the internal graph as an image.
[Graphviz](https://graphviz.org/) is used for graph rendering.
There is code for generating the corresponding Dot formatted output in [here](../src/fhir-resources/utils/graph/viz).
When the environment variable `DOT` is set to 1, you can check for this using function `shouldDot`.
