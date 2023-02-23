#!/usr/bin/env bash
set -o errexit -o errtrace

# run from project root
cd "$(dirname $0)/.."

# set up local dependencies for the editor
cd core && pnpm distribute -y editor.planx.uk
cd ../

trap 'echo "Cleaning up…" ; docker compose logs api; docker compose down --volumes --remove-orphans' ERR

function setupContainers(){
  # Destroy all previous containers and data (just in case)
  docker compose down --volumes --remove-orphans

  echo "Starting docker…"
  DOCKER_BUILDKIT=1 docker compose \
    -f docker-compose.yml \
    -f docker-compose.e2e.yml \
		--profile mock-services \
    up --build --wait test-ready

  echo "All containers ready."
}

setupContainers
