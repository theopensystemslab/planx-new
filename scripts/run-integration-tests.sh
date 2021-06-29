#!/usr/bin/env sh

set -e

SCRIPT_DIR=$(dirname "$0")
ROOT_DIR="${SCRIPT_DIR}/.."

echo "SCRIPT_DIR=${SCRIPT_DIR}"
echo "ROOT_DIR=${ROOT_DIR}"

# Go to root directory
cd "$ROOT_DIR" || exit

# Destroy all previous containers and data (just in case)
docker-compose down -v

trap 'echo "Cleaning up…" ; docker-compose down -v' EXIT

echo "Loading env vars…"
. "${ROOT_DIR}/.env"

# XXX: Starting postgres first makes Hasura start up faster
echo "Starting postgres…"
docker-compose up --build --remove-orphans -d postgres
echo "Waiting for Postgres to be ready…"
DONE=false
until $DONE; do
  sleep 0.1
  docker-compose logs postgres 2>/dev/null | grep -q "listening on IP" && DONE=true
done
echo "Postgres is up."

echo "Starting other services…"
docker-compose up --build --remove-orphans -d
echo "Waiting for Hasura to be ready…"
DONE=false
until $DONE; do
  sleep 0.1
  docker-compose logs hasura 2>/dev/null | grep -q "nothing to do" && DONE=true
done
echo "Hasura is ready"

echo "Running postgres tests…"
./hasura.planx.uk/run-postgres-tests.sh
echo "Postgres tests passed."

echo "Running Hasura tests…"
(cd hasura.planx.uk/tests && pnpm install && pnpm test)
echo "Hasura tests passed."
