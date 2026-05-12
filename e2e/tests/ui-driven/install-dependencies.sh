#!/usr/bin/env bash
set -e

cd $(dirname "$0")

if [ -d "../../../apps/editor.planx.uk/build" ]; then
  exit 0
fi

source ../../../.env

cd ../../../apps/editor.planx.uk
pnpm install --frozen-lockfile
VITE_APP_ENV=test pnpm build
