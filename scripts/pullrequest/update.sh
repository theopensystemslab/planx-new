#!/bin/sh

cat .env .env.staging > .env.prod

JWT_SECRET=${JWT_SECRET} SESSION_SECRET=${SESSION_SECRET} DOCKER_BUILDKIT=1 docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.staging.yml up --build --remove-orphans -d
