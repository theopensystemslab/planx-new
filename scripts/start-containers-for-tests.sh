#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(dirname "$0")
ROOT_DIR="${SCRIPT_DIR}/.."

echo "SCRIPT_DIR=${SCRIPT_DIR}"
echo "ROOT_DIR=${ROOT_DIR}"

# Go to root directory
cd "$ROOT_DIR" || exit

# Destroy all previous containers and data (just in case)
docker compose down --volumes --remove-orphans

trap 'echo "Cleaning up…" ; docker-compose down --volumes --remove-orphans' TERM INT

echo "Starting docker…"
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml -f docker-compose.e2e.yml --profile mock-services up --build -d test-ready

echo "All containers ready."
