# S4H Citizen App Client

With this single-page application Smart4Health users can see, manage and share their data in the Citizen Health Data Platform (CHDP).

## Table of contents

=================

- [S4H Citizen App Client](#s4h-citizen-app-client)
  - [Table of contents](#table-of-contents)
  - [Overview](#overview)
  - [Installation](#installation)
  - [Run commands](#run-commands)
  - [Project structure](#project-structure)
  - [Core Libraries](#core-libraries)
  - [D4L Javascript SDK](#d4l-javascript-sdk)
  - [React Waterfall(deprecated)](#react-waterfalldeprecated)
  - [Translations](#translations)
  - [Linting / CodeStyle](#linting--codestyle)
  - [Extending webpack configuration using Craco](#extending-webpack-configuration-using-craco)
    - [Objectives](#objectives)
    - [How it works](#how-it-works)
  - [Common issues](#common-issues)
    - [React PDF](#react-pdf)

## Overview

---

The application is bootstrapped using [create-react-app](https://github.com/facebook/create-react-app) and has not been ejected yet, meaning we deliberately limit our extension options in favour of easy installation and less configuration complexity. Please do not eject the app before consulting the team and discussing alternative solutions to what you are trying to do. Instead we use `craco` to extend the configuration provided by `react-scripts`

## Installation

---

`npm ci`

## Run commands

---

From the root folder run `npm start` which calls `start:server : node ./server/index.js` for starting the server and
`start:client: cd client && npm start` for starting the client. It also runs typescript in the watch mode.

## Project structure

---

```
├── public/
├── src/
│   └── components/...    # independent styled (scss files inside each one) componentes for re-use
│   └── config/...        # config files accross the app
│   └── containers/...    # parent components containing logic/how things work(deprecated)
│   └── features/...      # features in the application which also contain components specific to the feature
│   └── fhir/...          # fhir questionnaires used in the application
│   └── fonts/...         # fonts used in the application
│   └── hooks/...         # reusable React.js custom hooks
│   └── css/...           # global styling css files
│   └── mocks/...         # mocking files for tests
│   └── services/...      # files with function comunicating with API
│   └── store/...         # react-waterfall specific actions and state
│   └── redux/...         # redux store specific slices using redux toolkit
│   └── translations/...  # translation files with keys for copy
│   └── types/...         # flow types shared across the app
│   └── utils/...         # utility functions
│   └── App.js            # App.js files containing main/global routes and containers
│   └── Material.js       # Material-UI theme
│   └── index.js          # entry point for the client app containing component providers
├── package.json          # dependency list
├── .gitignore            # ignore files for git
```

## Core Libraries

---

- [react](https://reactjs.org/ 'react'): renders reactive UI components.
- [react-router](https://github.com/ReactTraining/react-router#readme 'react-router'): Navigational library
- ~~[react-waterfall](https://github.com/didierfranc/react-waterfall#readme): React store built on top of [the new context API](https://reactjs.org/docs/context.html)~~(we are migrating to redux)
  - we decided to use react-waterfall instead of Redux. The library is built on top of the Context API from React.
  - usefull links for the understaing of the react-waterfall:
    - https://reactjs.org/docs/context.html
    - https://medium.freecodecamp.org/replacing-redux-with-the-new-react-context-api-8f5d01a00e8c
    - https://medium.com/@DidierFranc/when-react-has-become-even-more-asynchronous-37a55c3a3d3
    - https://github.com/didierfranc/react-waterfall-example
- [redux-toolkit](https://redux-toolkit.js.org/): The official, opinionated, batteries-included toolset for efficient Redux development
- [axios](https://github.com/axios/axios 'Axios'): Promise based HTTP client.
- [material-ui](https://material-ui.com// '@material-ui'): Supply material design react components.
- [node-sass](https://github.com/sass/node-sass 'node-sass'): Provides binding for Node.js to LibSass
- [i18next](https://www.i18next.com/ 'i18next'): Internationalization-framework
- [jsPDF](https://github.com/MrRio/jsPDF 'jsPDF'): Client-side JavaScript PDF generation
- [jsZIP](https://github.com/Stuk/jszip#readme 'jsZIP'): Create, read and edit .zip files with Javascript

## D4L Javascript SDK

---

"This is the Javascript Web SDK of D4L, which encapsulates the backend functionality of the platform and enables end-to-end encryption of patient data. It allows users to store sensitive health data on the secure D4L platform and share it to authorized people and applications."

- https://github.com/d4l-data4life/js-sdk

The SDK is included as an npm dependency. The package is named `@d4l/js-sdk`. If you need a method within a file, import the SDK.

```
import D4LSDK from '@d4l/js-sdk';
```

If you need to work with a local unpublished version to try out changes, use `[npm link](https://docs.npmjs.com/cli/link.html)` to reference a build output in a local folder.

## React Waterfall(deprecated)

---

"React store built on top of the new context API" - https://github.com/didierfranc/react-waterfall

React-waterfall is used for managing state and actions troguhout the app. Main entry point is `/src/store/...`.

State (`/src/store//state.js`) is an immutable object that contains all the shared information and dynamic data that we use (global state, landingApp, documentsApp...).

Actions (`/src/store/actions/...`) are functions with optional payload that are processed to set a new state for the store. Every action receives it's first 2 parameters `(currentState: RootState, actions: Actions)` for usage (referencing some property from state, or to call another action) inside the function.

We use helper functions in each of the actions to have easy capability returning the respective individual state with global state.

For example, merging the documents state object to the global state object. We call this helper action when we return state in document actions.

```
const _setDocumentsAppState = (globalState, newDocumentsState) => {
  let { documentsApp } = globalState;

  // Override with new state
  documentsApp = { ...documentsApp, ...newDocumentsState };

  return { documentsApp };
};
```

Setting up of the store.

```
const config = {
  initialState,
  actionsCreators
};

const store: Store = createStore(config);
export const { Provider, connect, actions, subscribe } = store;
```

After setup we use `connect` function to connect `Components` to the store, `actions` reference to call actions and finaly `<Provider>` to wrap our App (`/src/index.js`).

## Translations

---

[i18next](https://www.i18next.com/) is the main driver for managing translations.

Translation files are committed to the repository and are bundled into the application at build time.

Usage of translation keys are going trough `import { withTranslation } from "react-i18next";` (https://react.i18next.com/latest/withtranslation-hoc).

Example:

```
import { withTranslation } from "react-i18next";
export default withTranslation()(SomeComponent)
```

To use with functional components, we prefer using the `useTranslation` hook coming from react-i18next instead.
(https://react.i18next.com/latest/usetranslation-hook)
Example:

```
import { useTranslation } from "react-i18next";
const exampleComponent = () => {
  const { t } = useTranslation();
}
```

To be able to update local translation files, provide lokalise credentials in the `.env` file. Refer to `.env.example` for the key names.
Run `npm run translations:import` to update the translation files.

## Linting / CodeStyle

---

The project uses [ESLint](https://eslint.org/) for linting and [Prettier](https://prettier.io/) for code formatting.

You can find the specified rules at `.eslintrc` and `.prettierrc` files located at the root of the project. The linting is based on the popular [Airbnb JavaScript Style Guide](http://airbnb.io/javascript/). The code formatting is a combination of the default Prettier configuration and the React ESLint plugin. The connection between ESLint and Prettier has been achieved by using the required plugins which are configured with `extends` property in the `.eslintrc` file:

```json
  "extends": [
    "airbnb",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
    "prettier/react"
  ]
```

There is also a `jsx-a11y` plugin as part of the linting process which is responsible for detecting potential accessibility related issues.

For better developer experience, please install the Prettier plugin for your code editor / IDE of choice and activate the `onSave` feature. This will give you a nice formatted files whenever you save your work. You can find plugins for popular code editors on the following links:

- [VSCode Plugin](https://github.com/prettier/prettier-vscode)
- [Atom Plugin](https://atom.io/packages/prettier-atom)
- [WebStorm Plugin](https://plugins.jetbrains.com/plugin/10456-prettier)

## Extending webpack configuration using Craco

This section explains in detail the project wide changes that had been made to build both Smart4Health and data4life web app from the same code base using [craco](https://github.com/craco) which helps in overriding the existing Create React App configurations without ejecting and hence giving us the advantage of the least configuration management.

### Objectives

The following are the objectives which are achieved:

1. Having different entry points for S4H and D4L applications.
2. Loading styles differentially.
3. Overide specific components to have an entirely different behavior.
4. Access the build context in the application during run time based on which specific parts can be feature toggled.
5. Having different logo, favicon and more depending on the build context.
6. Loading fonts differentially.

### How it works

The craco necessitates the installation of `@craco/craco` npm module to extend the Create React App configuration. Craco relies on the `craco.config.js` in the base path, where the necessary extensions has to be written. The API exposes ways to overide the configurations completely, or partially. By selecting the mode `extends`, we let know craco that the existing CRA configurations has to be retained, and the changes made would be adding/overwriting the existing configurations. It exposes direct ways to alter the build processes for SASS, Typescript and more and even has provisions to alter webpack plugins.

## Common issues

### React PDF

During [react-pdf](https://www.npmjs.com/package/react-pdf) version updates since there is a dependency on pdf.js there could be "Failed to load PDF" issues due to mismatch of the pdf.worker.js version required by pdf.js. The easy way to see which version of pdf.js we are using is to use use `console.log(pdfjs.version)`, in [PDFView.tsx](src/features/DocumentsViewer/GroupItem/PDFView/PDFView.tsx) file. And then download it from `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<pdfjs_version>/pdf.worker.min.js and update it [here](/client/public/js/pdf.worker.js). The reason why we have to manually update it is related to a decision made that we would have all our assets hosted in our premises.
