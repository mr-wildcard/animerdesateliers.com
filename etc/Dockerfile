FROM node:17.0-alpine

RUN apk add curl && \
    curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

USER node
