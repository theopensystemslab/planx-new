#!/usr/bin/env sh

echo "Running postgres tests…"

set -e

SCRIPT_DIR=$(dirname "$0")
ROOT_DIR="${SCRIPT_DIR}/../.."

# Load env vars
. "${ROOT_DIR}/.env"

# These DB tests require you to have Postgres up and the database created
# `docker-compose up --build` should do all of that for you

# When writing new tests, I suggest using `nodemon` to get a nice feedback-loop
# $ npx nodemon -e sql --exec "./run-tests.sh"

psql -v ON_ERROR_STOP=1 "postgres://${PG_USERNAME}:${PG_PASSWORD}@0.0.0.0:${PG_PORT}/${PG_DATABASE}" <"${SCRIPT_DIR}/tests/audit.test.sql"

echo "Postgres tests passed."
