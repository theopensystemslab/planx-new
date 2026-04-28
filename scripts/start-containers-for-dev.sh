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
  # Bring down e2e containers (including volumes) to avoid conflicts
  # project-name planx-e2e matches what start-containers-for-tests.sh uses
  DOCKER_DEFAULT_PLATFORM= docker compose \
    --project-name planx-e2e \
    -f docker-compose.yml \
    -f docker-compose.e2e.yml \
    --profile mock-services \
    down --volumes --remove-orphans

  # Destroy any previous dev containers and data
  dev_compose down --volumes --remove-orphans

  # Remove any dangling images that might cause conflicts
  echo "Cleaning up dangling images..."
  docker image prune -f || true

  echo "Starting docker…"

  DOCKER_BUILDKIT=1 dev_compose up -d --quiet-pull --build --renew-anon-volumes --force-recreate

  echo "Seeding database..."
  DOCKER_DEFAULT_PLATFORM= docker compose \
    -f docker-compose.yml \
    -f docker-compose.local.yml \
    -f docker-compose.seed.yml \
    run seed-database

  echo "All containers ready."
}

setupContainers
