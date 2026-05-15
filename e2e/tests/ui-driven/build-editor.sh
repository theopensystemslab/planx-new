#!/usr/bin/env bash
set -e

cd $(dirname "$0")

EDITOR_HASH=$(git -C ../../../ rev-parse HEAD:apps/editor.planx.uk)
HASH_FILE="../../../apps/editor.planx.uk/build/.editor-hash"

echo "build-editor: current editor hash: $EDITOR_HASH"

if [ ! -f "$HASH_FILE" ]; then
  echo "build-editor: no cached hash found, rebuilding"
elif [ "$(cat $HASH_FILE)" != "$EDITOR_HASH" ]; then
  echo "build-editor: hash mismatch (cached: $(cat $HASH_FILE)), rebuilding"
else
  echo "build-editor: hash match, skipping build"
  exit 0
fi

source ../../../.env

cd ../../../apps/editor.planx.uk
pnpm install --frozen-lockfile
VITE_APP_ENV=test pnpm build
echo "$EDITOR_HASH" > build/.editor-hash
