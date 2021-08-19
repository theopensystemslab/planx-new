#!/usr/bin/env bash

# docker system prune --volumes

git add . && git stash

git fetch origin pull/605/head && git checkout FETCH_HEAD

cat .env .env.staging > .env.prod

docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.staging.yml build --no-cache

docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.staging.yml up -d
