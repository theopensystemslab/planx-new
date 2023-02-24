#!/usr/bin/env sh
set -xe

SCRIPT_DIR=$(dirname "$0")

# Check whether `docker compose` or `docker-compose` is available
if command -v docker-compose > /dev/null; then
  DOCKER_COMPOSE=docker-compose
elif command -v docker compose > /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  echo "Neither docker compose nor docker-compose is available"
  exit 1
fi

REMOTE_PG="${PRODUCTION_PG_URL_FOR_USER_GITHUB_ACTIONS}"
LOCAL_PG="postgres://${PG_USERNAME}:${PG_PASSWORD}@postgres/${PG_DATABASE}"

cd "${SCRIPT_DIR}/../../" || exit
${DOCKER_COMPOSE} run --rm -v "$(pwd):/app" postgres /app/scripts/seed-database/container.sh "${LOCAL_PG}" "${REMOTE_PG}"
cd - || exit 1
