#!/bin/bash
set -eo pipefail

SCRIPT_DIR=$(dirname ${0})
PROJECT_ROOT=$SCRIPT_DIR/../..
cd ${PROJECT_ROOT}

LOCAL_PG=postgres://${PG_USERNAME}:${PG_PASSWORD}@postgres/${PG_DATABASE}
REMOTE_PG=${PRODUCTION_PG_URL_FOR_USER_GITHUB_ACTIONS}

# run the sync script inside a docker container
docker compose run --rm -v "$(pwd):/app" \
  postgres /app/scripts/seed-database/container.sh ${LOCAL_PG} ${REMOTE_PG}
