#!/usr/bin/env bash
set -o errexit -o errtrace

# run from project root
cd "$(dirname $0)/.."

# destroy dev containers and volumes
docker compose \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  --profile mock-services \
  down --volumes --remove-orphans

# also destroy e2e containers and volumes (project-name planx-e2e matches start-containers-for-tests.sh)
DOCKER_DEFAULT_PLATFORM= docker compose \
  --project-name planx-e2e \
  -f docker-compose.yml \
  -f docker-compose.e2e.yml \
  --profile mock-services \
  down --volumes --remove-orphans
