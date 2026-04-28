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

  # Bring dev containers back up, preserving existing volumes so local data changes are not lost.
  # For a clean first-time setup, use `pnpm up` instead.
  DOCKER_BUILDKIT=1 dev_compose up -d --quiet-pull --build --force-recreate

  echo "All containers ready."
}

setupContainers
