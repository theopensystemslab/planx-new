#!/usr/bin/env bash
set -e

cd $(dirname "$0")

source ../../../.env

if [ -z "${SKIP_EDITOR_BUILD}" ]; then
  cd ../../../apps/editor.planx.uk
  pnpm install --frozen-lockfile
  VITE_APP_ENV=test pnpm build
fi
