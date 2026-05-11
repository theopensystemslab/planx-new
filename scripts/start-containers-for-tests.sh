#!/usr/bin/env bash
set -o errexit -o errtrace

# run from project root
cd "$(dirname $0)/.."

# --project-name planx-e2e isolates e2e volumes from the dev project
#
# clear DOCKER_DEFAULT_PLATFORM in case it was set in .env for Apple Silicon.
function e2e_compose() {
  DOCKER_DEFAULT_PLATFORM= docker compose \
    --project-name planx-e2e \
    -f docker-compose.yml \
    -f docker-compose.e2e.yml \
    --profile mock-services \
    "$@"
}

trap 'echo "Error detected! Saving logs..."; \
      e2e_compose logs > docker_compose_logs.txt; \
      echo "Logs saved to docker_compose_logs.txt"; \
      e2e_compose down --volumes --remove-orphans' ERR

function setupContainers(){
  # Bring down the dev environment containers
  # volumes are kept as they are a different docker project
  docker compose \
    -f docker-compose.yml \
    -f docker-compose.local.yml \
    --profile mock-services \
    down --remove-orphans

  # Destroy any previous e2e containers and data
  e2e_compose down --volumes --remove-orphans

  echo "Building images..."

  if [ -n "$CI" ]; then
    # In CI, build with GitHub Actions cache so layers are reused across runs.
    # ACTIONS_CACHE_URL and ACTIONS_RUNTIME_TOKEN are injected into the BuildKit
    # daemon container via driver-opts in the setup-buildx-action workflow step,
    # so BuildKit can read them as env vars and authenticate with the GHA cache.
    docker buildx bake \
      -f docker-compose.yml \
      -f docker-compose.e2e.yml \
      --set "*.cache-from=type=gha" \
      --set "*.cache-to=type=gha,mode=max" \
      --load
  else
    DOCKER_BUILDKIT=1 e2e_compose build
  fi

  echo "Starting docker…"

  DOCKER_BUILDKIT=1 e2e_compose up --no-build --wait test-ready
  echo "All containers ready."
}

setupContainers
