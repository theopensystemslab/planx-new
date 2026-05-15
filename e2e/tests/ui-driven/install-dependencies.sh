#!/usr/bin/env bash
set -e

cd $(dirname "$0")

# test change for editor.planx.uk build hash

EDITOR_HASH=$(git -C ../../../ rev-parse HEAD:apps/editor.planx.uk)
HASH_FILE="../../../apps/editor.planx.uk/build/.editor-hash"

if [ -f "$HASH_FILE" ] && [ "$(cat $HASH_FILE)" = "$EDITOR_HASH" ]; then
  exit 0
fi

source ../../../.env

cd ../../../apps/editor.planx.uk
pnpm install --frozen-lockfile
VITE_APP_ENV=test pnpm build
echo "$EDITOR_HASH" > build/.editor-hash
