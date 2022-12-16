#!/usr/bin/env bash
set -o errexit -o pipefail

# run from project root
cd "$(dirname $0)/../.."

# set env for this shell
set -o allexport
source .env.pizza
export DOCKER_BUILDKIT=1
set +o allexport

docker compose \
  -f docker-compose.yml \
  -f docker-compose.pizza.yml \
  up --build --renew-anon-volumes --force-recreate --remove-orphans --wait
