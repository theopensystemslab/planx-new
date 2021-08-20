#!/usr/bin/env bash

# docker system prune --volumes
# PULLREQUEST_ID=$(hostname | tr -dc '0-9')

# git add . && git stash
# git fetch origin pull/${PULLREQUEST_ID}/head && git checkout FETCH_HEAD

cat .env .env.staging > .env.prod

docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.staging.yml build --no-cache

docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.staging.yml up -d
