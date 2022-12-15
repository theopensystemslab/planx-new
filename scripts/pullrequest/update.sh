#!/usr/bin/env bash
set -o errexit -o pipefail

export DOCKER_BUILDKIT=1

docker compose --env-file .env.pizza \
  -f docker-compose.yml \
  -f docker-compose.pizza.yml \
  up --build --renew-anon-volumes --force-recreate --remove-orphans --wait
