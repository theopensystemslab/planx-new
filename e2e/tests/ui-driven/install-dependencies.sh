#!/usr/bin/env bash
set -e

cd $(dirname "$0")

source ../../../.env

(cd ../../../apps/editor.planx.uk && pnpm install --frozen-lockfile && VITE_APP_ENV=test pnpm build)