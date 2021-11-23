#!/usr/bin/env sh
set -xe

SCRIPT_DIR=$(dirname "$0")
. "$SCRIPT_DIR/../.env"

if [ -z "${CI}" ]; then
  # Kill all subprocesses on exit (e.g. pnpx serve) -- https://unix.stackexchange.com/a/67552/141425
  # XXX: Doesn't seem to work with CI but we need it for the development environment
  trap "exit 0" INT TERM
  trap "kill 0" EXIT
fi

pnpx --yes serve ../editor.planx.uk/build \
  --config "$(readlink -f "${SCRIPT_DIR}/serve.json")" `# https://github.com/vercel/serve/issues/662`\
  --no-clipboard --no-port-switching --listen 3000 >/dev/null &

if [ -x "$(command -v chrome)" ]; then
  BROWSER="chrome"
else
  BROWSER="chromium"
fi

if [ -z "${CI}" ]; then
  HEADLESS=""
else
  HEADLESS=":headless"
fi

JWT_SECRET=$JWT_SECRET testcafe --browser-init-timeout 600000 "${BROWSER}${HEADLESS}" './tests/*.js'
