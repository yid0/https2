#!/bin/bash

set -e

NODE_ENV=$1

PORT=$2

TAG=$(cat package.json | jq -r '.version')

docker rm -f https2

docker run --name https2 --env-file env/.env.$NODE_ENV -p $PORT:$PORT https2:$TAG

exit 0;