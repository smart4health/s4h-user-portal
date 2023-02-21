#!/usr/bin/env sh

if [ -z "$ENV" ]
then
  echo "ENV not set"
  exit 1
fi

node server/index.js
