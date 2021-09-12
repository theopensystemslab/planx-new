#!/bin/bash

DOCKER_BUILDKIT=1 docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.staging.yml up --build --force-recreate --remove-orphans -d
