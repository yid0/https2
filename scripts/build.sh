#/bin/bash

set -e

NODE_ENV=$1
TAG=$(git describe --tags)

docker build -t https2:$TAG . --build-arg "NODE_ENV=$NODE_ENV" --no-cache --target prod

exit 0;