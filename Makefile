.PHONY: docker-build docker-run docker-stop

DOCKER_IMAGE := s4h-citizen-app

# This version-strategy uses git tags to set the version string
APP_VERSION ?= $(shell git describe --tags --always --dirty)
GIT_COMMIT := $(shell git log --pretty=format:'%h' -n 1)

TARGET_ENVIRONMENT ?= dev

DOCKER_TAG_CLIENT_CODE := client_code
DOCKER_TAG_SERVER_CODE := server_code
DOCKER_TAG_PUSH := $(APP_VERSION)

NODE_VERSION ?= 16

TIMESTAMP_RFC3339 := $(shell date +%Y-%m-%dT%T%z)

docker-build:
	docker build \
		--build-arg TARGET_ENVIRONMENT=$(TARGET_ENVIRONMENT) \
		--build-arg NODE_VERSION=$(NODE_VERSION) \
		--build-arg APP_VERSION=$(APP_VERSION) \
		--build-arg GIT_COMMIT=$(GIT_COMMIT) \
		--build-arg BUILD_DATE=$(TIMESTAMP_RFC3339) \
		-t $(DOCKER_IMAGE):$(DOCKER_TAG_PUSH) \
		.

docker-run:
ifndef OAUTH_CLIENT_ID
	$(error OAUTH_CLIENT_ID is undefined)
endif
ifndef OAUTH_CLIENT_SECRET
	$(error OAUTH_CLIENT_SECRET is undefined)
endif
	docker run --name user-portal \
		-p 8080:8080 \
		-e OAUTH_REDIRECT_URI=https://localhost:3000 \
		-e COOKIE_KEY=local_cookie_key \
		-e STATIC_CONTENT_PATH=client/build/ \
		-e FEATURE_FLAGS_HOST=https://features-dev.hpsgc.de/svc \
		-e USER_DATA_HOST=https://userdata-dev.hpsgc.de \
		-e TCTOKEN_URL=https://api-dev.smart4health.eu/devices/api/v1/eid/saml-entrance \
		-e TCTOKEN_URL_EIDAS=https://api-dev.smart4health.eu/devices/api/v1/eidas/saml-entrance \
		-e OAUTH_CLIENT_ID=$(OAUTH_CLIENT_ID) \
		-e OAUTH_CLIENT_SECRET=$(OAUTH_CLIENT_SECRET) \
		-e GC_HOST=https://api-dev.smart4health.eu \
		-e HADES_HOST=https://api-dev.smart4health.eu \
		-e AUTH_SERVICE_USERS_URL=https://api-dev.smart4health.eu/users \
		-e AUTH_SERVICE_TOKEN_URL=https://api-dev.smart4health.eu/oauth/token \
		-e AUTH_SERVICE_REVOKE_URL=https://api-dev.smart4health.eu/oauth/revoke \
		$(DOCKER_IMAGE):$(DOCKER_TAG_PUSH)

docker-stop:
	docker kill user-portal && \
	  docker rm user-portal
