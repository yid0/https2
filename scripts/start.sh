#/bin/bash

set -e

node --env-file env/.env.$NODE_ENV ./dist/main.js

exit 0;
