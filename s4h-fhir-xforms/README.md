# FHIR transformation library

This library contains functionality for the following tasks:

## Main tasks

Reading models from and writing models to CHDP.

### Read models

- Derive _group list_ UI model from CHDP records.
- Derive _medical history_ UI model from CHDP records.
- Derive _medication list_ UI model from CHDP records.

### Write models

- Update CHDP given a _medical history_ UI model.

## Helper tasks

The following functionality is needed by the main tasks above but is exposed to be used stand-alone, too.

- Runtime validation of FHIR resources.
- Value set retrieval.
- Resolution of [CodeableConcept](https://www.hl7.org/fhir/datatypes.html#CodeableConcept)s to human-readable strings.

## Documentation

See [./docs](./docs) for details.

## Building and bundling

The objective is to create a JavaScript module bundle that can be used as a browser library.
[Webpack](https://webpack.js.org/) is used for module bundling.

```sh
npm install
npm run build:prod
```

You find the bundle in folder `./dist`.

## Building and testing

We use Karma for testing in a (headless) browser.

```sh
npm install
npm run test
```

There are `:w` suffixed scripts that watch the sources and re-run when changes are detected.
The following environment variables are honored by the test runner:
- `DUMP`: If set to 1 there will be verbose output of the test cases.
- `BROWSER`: Overrides the default browser (`ChromeHeadless`) for testing (you might need to install additional packages when choosing another test environment).
- `SUITE`: Select which test suites are run (defaults to `all`). See [karma.config.js](./karma.config.js) for details.
