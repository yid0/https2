#!/bin/bash

set -e

echo "Start https2 server/container on $NODE_ENV mode."

node --env-file env/.env.$NODE_ENV ./dist/main.js

exit 0;
