#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "$0")
. "$SCRIPT_DIR/../.env"

set -e

(cd "${SCRIPT_DIR}/../core" && pnpm install && pnpm build && pnpm distribute)
(cd "${SCRIPT_DIR}/../editor.planx.uk" && pnpm install && pnpm build)

if [ -z "${CI}" ]; then
  echo "Please make sure you have Chrome installed on this machine."
else
  echo "Installing E2E dependencies…"
  sudo sed -i 's/azure\.//' /etc/apt/sources.list # tmp fix for flaky azure mirror (see: https://github.com/actions/runner-images/issues/675)
  sudo apt-get update
  sudo apt-get install --fix-broken -y libappindicator1 fonts-liberation chromium-browser
fi
