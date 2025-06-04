#!/usr/bin/env bash
set -o errexit -o pipefail

# run from project root
cd "$(dirname $0)/../.."

# set env for this shell
set -o allexport
source .env.pizza
DOCKER_BUILDKIT=1
set +o allexport

# Conditionally run non-essential services
declare -a profile_args

if [[ $RUN_STORYBOOK == "true" ]]; then
  profile_args+=("--profile" "storybook")
fi

if [[ $RUN_LOCALPLANNING == "true" ]]; then
  profile_args+=("--profile" "localplanning")
fi

echo "Starting Docker Compose with profiles: ${COMPOSE_PROFILES}"

docker compose \
  -f docker-compose.yml \
  -f docker-compose.pizza.yml \
  -f docker-compose.seed.yml \
  "${profile_args[@]}" \
  up --build --renew-anon-volumes --force-recreate --remove-orphans --wait
