#!/usr/bin/env bash
set -o errexit -o errtrace

# run from project root
cd "$(dirname $0)/.."

# clear DOCKER_DEFAULT_PLATFORM in case it was set in .env for Apple Silicon.
function dev_compose() {
  DOCKER_DEFAULT_PLATFORM= docker compose \
    -f docker-compose.yml \
    -f docker-compose.local.yml \
    --profile mock-services \
    "$@"
}

trap 'echo "Error detected! Saving logs..."; \
      dev_compose logs > docker_compose_logs.txt; \
      echo "Logs saved to docker_compose_logs.txt"; \
      dev_compose down --remove-orphans' ERR

function setupContainers(){
  # Compiled workspace packages must be built before `up`: the api container now reads
  # @planx/file-upload's dist/ straight off the host (see docker-compose.local.yml)
  ./scripts/build-packages.sh

  # Bring down e2e containers and their volumes - we're done with testing
  # project-name planx-e2e matches what start-containers-for-tests.sh uses
  DOCKER_DEFAULT_PLATFORM= docker compose \
    --project-name planx-e2e \
    -f docker-compose.yml \
    -f docker-compose.e2e.yml \
    --profile mock-services \
    down --volumes --remove-orphans

  # Remove any dangling images that might cause conflicts
  echo "Cleaning up dangling images..."
  docker image prune -f || true

  echo "Starting docker…"

  # Bring dev containers back up, preserving the named postgres_data volume so local data
  # changes are not lost. For a clean first-time setup (including seeding the db), use
  # `pnpm run up` instead.
  #
  # --renew-anon-volumes re-seeds /api/node_modules and /sharedb/node_modules from the freshly
  # built images - without it, compose carries the old ones over and newly added dependencies
  # are missing at runtime. Safe: postgres uses a named volume and minio a host bind, so no
  # dev data lives in an anonymous volume.
  DOCKER_BUILDKIT=1 dev_compose up -d --quiet-pull --build --force-recreate --renew-anon-volumes

  echo "All containers ready."
}

setupContainers
