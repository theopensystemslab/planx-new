#!/usr/bin/env sh
SCRIPT_DIR=$(dirname "$0")
. "$SCRIPT_DIR/../.env"

set -xe

if [ -z "${CI}" ]; then
  # Kill all subprocesses on exit (e.g. pnpm dlx serve) -- https://unix.stackexchange.com/a/67552/141425
  # XXX: Doesn't seem to work with CI but we need it for the development environment
  trap "exit 0" INT TERM
  trap "kill 0" EXIT
fi

pnpm dlx serve ../editor.planx.uk/build \
  --config "$(pwd)/serve.json" `# https://github.com/vercel/serve/issues/662` \
  --no-clipboard --no-port-switching --listen 3000 >/dev/null &

echo "Waiting for the server to start..."

./wait-for-it.sh localhost:3000 --strict

{
  ./wait-for-it.sh localhost:7002 --strict
} || {
  ROOT_DIR="${SCRIPT_DIR}/.."
  cd "$ROOT_DIR" || exit

  docker-compose logs api && exit 1
}

if [ -z "${CI}" ]; then
  MODE="--headed"
else
  MODE=""
fi

set +x

JWT_SECRET=$JWT_SECRET HASURA_PROXY_PORT=$HASURA_PROXY_PORT HASURA_GRAPHQL_ADMIN_SECRET=$HASURA_GRAPHQL_ADMIN_SECRET playwright test

