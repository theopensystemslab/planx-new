#!/usr/bin/env bash
set -e

cd $(dirname "$0")

source ../../../.env

(NODE_ENV=test cd ../../../editor.planx.uk && pnpm install && pnpm build)

if [ -z "${CI}" ]; then
  echo "Please make sure you have Chrome installed on this machine."
else
  echo "Installing E2E dependencies…"
  sudo apt-get update
  sudo apt-get install -y libappindicator1 fonts-liberation chromium-browser
fi
