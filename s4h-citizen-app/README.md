# S4H Citizen App

This web app allows users to manage and share privately their medical information.

## Table of contents

- [Components](#Components)
- [Installation](#Installation)
- [Build commands](#Build-commands)
- [Development](#Development)

## Components

The web app consists of a frontend and a backend.
Most of the usecases are implemented in the frontend.
The backend serves the built files. In addition it has only few features.

### Frontend

It is built using ReactJS and depends on Create React App for scaffolding the application. `craco` is used to extend the CRA without ejecting it and a mixture of TypeScript and Javascript.
For detailed information, see: [Client Readme](client/README.md).

### Backend for Frontend

The backend serves the built frontend artifacts.
It enriches the static `html` content with configuration.

A gated OAuth client is used for exchanging the `authorization_code` for an `access token`.
In the users' session, the refresh token is kept securely.
Therefore, the logout with the `refresh_token` must happen through the backend.


## Installation

This project uses [NPM](https://www.npmjs.com/) as the dependency manager.

Install all dependencies in the root and inside the client folder by running:

```
npm install
cd client
npm install --link ../../s4h-fhir-xforms

```

## Build commands

### JavaScript

#### Build the app

```
npm run build
```

## Development

For development purposes when client and server start they will run on separate ports.
The server is available on `8080` and the client on `3000`.
In order to `register/log-in`, you'll need a way to connect to the auth service and web-auth-app.

This can be done by connecting to a live cluster (`phdp-dev`, `phdp-staging`).

Connecting to Vega on the dev or staging instance only requires setting up variables in `.env` file before starting the server.


### Running locally

The frontend and backend are 2 separate applications.
They run individually by starting their own processes.

Before you start, you have to provide the configuration via environment variables or a `.env` file.
You can take over the values from the example data in `.env.example` to let the application connect to the dev cluster.

You can start the S4H Citizen App from the application root folder by running:

```bash
npm run start
```

This will boot up both server and client for development on their respectful ports.

Some considerations you need to follow:

These are all the configuration settings that can be specified via environment variables:

| variable name       | default value   | description                            |
| ------------------- | --------------- | -------------------------------------- |
| PORT                | 8080            | HTTP port to use for web server        |
| OAUTH_CLIENT_ID     |                 | OAuth client id configured in Vega     |
| OAUTH_CLIENT_SECRET |                 | OAuth secret configured in Vega        |
| OAUTH_REDIRECT_URI  |                 | OAuth redirection uri                  |
| STATIC_CONTENT_PATH | client/build/   | Relative location of static content    |
| CLIENT_NAME         | s4h-citizen-app | Should be deprecated (to be confirmed) |

### Session handling

In order to store the session a cookie based approach was taken.
The S4H Citizen App needs to keep 3 pieces of information in order to 'log-in' a user in case of a refresh.

1. access_token
2. CAP
3. refresh_token

Access token is not stored.
It is kept in memory only.

CAP is stored in the WebCrypto API.

A cookie is used to identify the users session against the backend.
The refresh_token stored on the server.
When the frontend requests an `access_token` it presents the session cookie and allows the backend to retrieve the `refresh_token`.
The `refresh_token` is presented to the auth service.

### Sharing

Through sharing, a sharing user enables a receiving (anonymous) user access the records.
Multiple services are involved:

- Handshake Service: creating pin for the receiving user and validate a pin for the sharing user
- Auth Service: adding / revoking permissions
- Record / Blob: provide data

The approval of a new permission is done at the Auth Service.
Thereby, the sharing user is authenticated with its `auth`-cookie.
This is set when the user initiate its login and used in the communication between the Auth Service and the Web-Auth-App.
Until now, this cookie has a TTL of only some minutes.
Afterwards, sharing is not possible anymore.

### CHANGELOG

The changelog is maintained here: [CHANGELOG.md](CHANGELOG.md)
Please, add your modification to the changelog according to the best practices of [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

** Guiding Principles **
- Changelogs are for humans, not machines.
- There should be an entry for every single version.
- The same types of changes should be grouped.
- Versions and sections should be linkable.
- The latest version comes first.
- The release date of each version is displayed.
- Mention whether you follow Semantic Versioning.

** Types of changes **
- Added for new features
- Changed for changes in existing functionality
- Deprecated for soon-to-be removed features
- Removed for now removed features
- Fixed for any bug fixes
- Security in case of vulnerabilities
