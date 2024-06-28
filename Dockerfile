FROM node:22-slim as build

ARG NODE_ENV=${NODE_ENV}

USER node

WORKDIR /app

COPY --chown=node:node  ./src ./src

COPY --chown=node:node package*.json tsconfig.json ./

COPY --chown=node:node ./scripts/ssl.sh ./scripts/start.sh ./scripts/

COPY --chown=node:node ./env/.env.${NODE_ENV} ./env/.env.${NODE_ENV}

RUN npm i -d && npm run build && ls -la


## Generate production image
FROM node:22-slim as prod

USER 1001

ARG NODE_ENV=${NODE_ENV}
ENV NODE_ENV=${NODE_ENV}

ENV HOST=localhost
ARG VERSION=${VERSION}
ENV VERSION=${VERSION}

ENV SERVER_TYPE=${SERVER_TYPE}
ENV HTTP_PORT=${HTTP_PORT}
ENV HTTPS_PORT=${HTTPS_PORT}
ENV HTTP2_PORT=${HTTP2_PORT}

ENV MODE=${MODE}
ENV CORES=${CORES}
ENV NODE_ENV=${NODE_ENV}
 
WORKDIR /app

COPY --from=build --chown=1001:1001 ./app/dist /app/dist
COPY --from=build --chown=1001:1001 ./app/certs/start.sh /app/certs

COPY --from=build --chown=1001:1001 ./app/scripts/start.sh /app/scripts/start.sh
COPY --from=build --chown=1001:1001 ./app/env/.env.${NODE_ENV} /app/env/.env.${NODE_ENV}

RUN chmod +x /app/scripts/start.sh && VERSION=${VERSION}

CMD [ "./scripts/start.sh" ]