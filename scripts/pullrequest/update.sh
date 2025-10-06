#!/usr/bin/env bash
set -o errexit -o pipefail

# run from project root
cd "$(dirname $0)/../.."

# set env for this shell
set -o allexport
source .env.pizza
DOCKER_BUILDKIT=1
set +o allexport

PIZZA_FAILOVER=""
if ! docker pull "$VULTR_CR_URN/caddy-vultr:latest"; then
  echo "Failed to pull caddy image, building from source..."
  PIZZA_FAILOVER="-f docker-compose.pizza.failover.yml"
fi

# explicitly drop containers in case provenance of caddy container is changed
docker compose \
  -f docker-compose.yml \
  -f docker-compose.pizza.yml $PIZZA_FAILOVER \
  -f docker-compose.seed.yml \
  down --remove-orphans

docker compose \
  -f docker-compose.yml \
  -f docker-compose.pizza.yml $PIZZA_FAILOVER \
  -f docker-compose.seed.yml \
  up --build --renew-anon-volumes --force-recreate --wait
