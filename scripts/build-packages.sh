#!/bin/sh
# Build the workspace's compiled packages (i.e. anything under packages/* with a `build` script).
#
# Wired to the root `postinstall` and to .husky/post-merge. We need this because @planx/file-upload (as an example)
# is consumed via dist/, and `pnpm install` only ever *symlinks* workspace packages - it never builds them.
# Turbo-routed tasks get this for free via `^build` , but raw invocations do not (e.g. vite, vitest, tsc).
#
# Deliberately POSIX sh, since Alpine containers do not ship with `bash`` (preferring Busybox `ash``).
set -eu

# turbo resolves `--filter=./path/*` globs relative to CWD, so always work from the repo root
cd "$(dirname "$0")/.."

if [ -n "${CI:-}" ]; then
  echo "build-packages: CI detected, skipping (workflows build explicitly via turbo)"
  exit 0
fi

# Docker image builds install *before* copying source (e.g. api.planx.uk installs from a
# `turbo prune --docker` tree, whose `json/` stage holds package.jsons + lockfiles only)
if [ ! -f turbo.json ] || [ ! -d packages ]; then
  echo "build-packages: not a full workspace checkout, skipping"
  exit 0
fi

echo "build-packages: building compiled workspace packages…"
exec pnpm exec turbo run build --filter="./packages/*"
