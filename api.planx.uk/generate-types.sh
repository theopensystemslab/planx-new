#!/usr/bin/env sh
SCRIPT_DIR=$(dirname "$0")
ROOT_DIR="${SCRIPT_DIR}/.."

# Load env vars
set -a
. "${ROOT_DIR}/.env"
set +a

pnpm graphql-codegen