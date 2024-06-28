#!/bin/bash

set -e

NODE_ENV=$1
TAG=$(cat package.json | jq -r '.version')

docker build -t https2:$TAG . --build-arg "NODE_ENV=$NODE_ENV" --build-arg "VERSION=$TAG" --no-cache --target prod

exit 0;