#!/bin/sh
# Build the workspace's compiled packages (anything under packages/* with a `build` script).
#
# Wired to the root `postinstall` and to .husky/post-merge: @planx/file-upload is consumed via
# its dist/, and `pnpm install` only ever *symlinks* workspace packages - it never builds them.
# Turbo-routed tasks get this for free via `^build` (see turbo.json), but raw invocations do
# not: vite, vitest, `tsc --noEmit` and your editor's tsserver all read dist/ directly.
#
# Deliberately POSIX sh, not bash: apps/sharedb.planx.uk/Dockerfile runs a full-source
# workspace `pnpm install` inside node:*-alpine, which has no bash.
set -eu

# turbo resolves `--filter=./path/*` globs relative to CWD, so always work from the repo root
cd "$(dirname "$0")/.."

if [ -n "${CI:-}" ]; then
  echo "build-packages: CI detected, skipping (workflows build explicitly via turbo)"
  exit 0
fi

# Docker image builds install *before* copying source (api.planx.uk installs from a
# `turbo prune --docker` tree of package.jsons + lockfile only), so there is nothing to build
if [ ! -f turbo.json ] || [ ! -f packages/file-upload/tsconfig.json ]; then
  echo "build-packages: package sources not present, skipping"
  exit 0
fi

echo "build-packages: building compiled workspace packages…"
exec pnpm exec turbo run build --filter="./packages/*"
