#!/bin/sh

cat .env .env.staging > .env.prod

DOCKER_BUILDKIT=1 docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.staging.yml up --build --remove-orphans -d
