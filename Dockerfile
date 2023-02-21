# Accept the Node version for the image to be set as a build argument.
# Default to Node 16
ARG NODE_VERSION=16

FROM node:${NODE_VERSION}-alpine AS base

RUN apk update && apk upgrade
RUN apk add --no-cache --virtual .gyp \
  python3 \
  make \
  g++ \
  git

# Turning on legacy-peer-deps as craco is still not supporting react-scripts v5
RUN npm config set legacy-peer-deps true

# TARGET_ENVIRONMENT sets the target GHC environment
ARG TARGET_ENVIRONMENT
ENV ENV=$TARGET_ENVIRONMENT

FROM base as server_code

WORKDIR /app

COPY s4h-citizen-app/server/ ./server

COPY s4h-citizen-app/package.json s4h-citizen-app/package-lock.json ./

RUN npm ci

RUN npm run test:server

RUN npm prune --production

FROM base as client_code

ARG REACT_APP_LOCAL_SDK=false
ENV REACT_APP_LOCAL_SDK=${REACT_APP_LOCAL_SDK}

WORKDIR /client

# Copy configurations files first as they are least susceptible to change, to optimise docker caching.
COPY s4h-citizen-app/client/.eslintrc s4h-citizen-app/client/.stylelintrc ./

# Copy env.js helper for the client's tests
COPY s4h-citizen-app/server/env.js /server/
COPY s4h-fhir-xforms /s4h-fhir-xforms/

# Install dependencies for client
COPY s4h-citizen-app/client/package.json ./

# Install the dependencies
RUN npm install --link /s4h-fhir-xforms

# Copy the client source and the build boilerplate
COPY s4h-citizen-app/client/public ./public/
COPY s4h-citizen-app/client/src ./src/
COPY s4h-citizen-app/client/tsconfig.json s4h-citizen-app/client/craco.config.js ./

# Build the client code
RUN npm run build

# Start with the final node image from scratch
# This stage will copy the previous precompiled client-build and prod node_modules from server
FROM node:${NODE_VERSION}-alpine AS release

WORKDIR /app

ARG TARGET_ENVIRONMENT
ARG NODE_VERSION=16
ARG APP_VERSION=undefined
ARG GIT_COMMIT=undefined
ARG BUILD_DATE=undefined

ENV ENV=$TARGET_ENVIRONMENT

LABEL org.label-schema.build-date="$BUILD_DATE"
LABEL org.label-schema.name="s4h-user-portal"
LABEL org.label-schema.description="S4H User Portal"
LABEL org.label-schema.vcs-url="https://github.com/smart4health/s4h-user-portal"
LABEL org.label-schema.vcs-ref="$GIT_COMMIT"
LABEL org.label-schema.vendor="D4L data4life gGmbH"
LABEL org.label-schema.version="$APP_VERSION"
LABEL org.label-schema.schema-version="1.0"
LABEL node-version="$NODE_VERSION"
LABEL target-environment="$TARGET_ENVIRONMENT"

COPY --from=client_code /client/build ./client/build/
COPY --from=server_code /app/node_modules ./node_modules
COPY --from=server_code /app/server ./server
COPY s4h-citizen-app/start.sh ./

EXPOSE 8080

# Run the container as an unprivileged user
USER nobody:nobody

CMD [ "./start.sh" ]

