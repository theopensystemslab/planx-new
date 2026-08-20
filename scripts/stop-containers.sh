#!/usr/bin/env bash
set -o errexit -o errtrace

# run from project root
cd "$(dirname $0)/.."

# stop dev containers without destroying volumes
docker compose \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  --profile mock-services \
  down

# also stop e2e containers (project-name planx-e2e matches start-containers-for-tests.sh) without destroying volumes
DOCKER_DEFAULT_PLATFORM= docker compose \
  --project-name planx-e2e \
  -f docker-compose.yml \
  -f docker-compose.e2e.yml \
  --profile mock-services \
  down
