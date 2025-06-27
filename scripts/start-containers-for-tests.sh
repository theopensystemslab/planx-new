#!/usr/bin/env bash
set -o errexit -o errtrace

# run from project root
cd "$(dirname $0)/.."

trap 'echo "Cleaning up…" ; docker compose logs api; docker compose down --volumes --remove-orphans' ERR

function setupContainers(){
  # Destroy all previous containers and data (just in case)
  docker compose down --volumes --remove-orphans

  # Remove any dangling images that might cause conflicts
  echo "Cleaning up dangling images..."
  docker image prune -f || true

  echo "Starting docker…"

  # Build
  DOCKER_BUILDKIT=1 docker compose \
    -f docker-compose.yml \
    -f docker-compose.e2e.yml \
    --profile mock-services \
    build

  # Run
  DOCKER_BUILDKIT=1 docker compose \
    -f docker-compose.yml \
    -f docker-compose.e2e.yml \
    --profile mock-services \
    up --wait test-ready
    echo "All containers ready."
  }

setupContainers
