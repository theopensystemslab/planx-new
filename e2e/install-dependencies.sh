#!/usr/bin/env sh
set -xe

SCRIPT_DIR=$(dirname "$0")
. "$SCRIPT_DIR/../.env"

(cd "${SCRIPT_DIR}/../hasura.planx.uk" && pnpm install)
(cd "${SCRIPT_DIR}/../editor.planx.uk" && pnpm install && pnpm build)

if [ -z "${CI}" ]; then
  echo "Please make sure you have Chrome installed on this machine."
else
  echo "Installing E2E dependencies…"
  sudo apt-get install -y libappindicator1 fonts-liberation chromium-browser 
fi
