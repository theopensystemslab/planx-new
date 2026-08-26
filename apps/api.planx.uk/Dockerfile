# syntax=docker/dockerfile:1.20
ARG NODE_VERSION=24.14.1

## TOOLCHAIN ##
# Shared node+pnpm layer, reused by every stage below
FROM node:${NODE_VERSION}-alpine AS toolchain
RUN npm install -g pnpm@10.30.2

## PRUNE ##
# Produce a pruned monorepo containing only api.planx.uk + its workspace dependencies
FROM toolchain AS pruner
WORKDIR /app
RUN npm install -g turbo@2.10.2
COPY . .
RUN turbo prune api.planx.uk --docker

## BASE ##
# Dependencies only - kept free of source so it survives source-only edits
FROM toolchain AS base

# Insurance only: planx-core's catalog spec currently resolves to a codeload tarball in the
# lockfile, so no clone happens under --frozen-lockfile - but a branch/ssh spec would need git again
RUN apk add --no-cache git
COPY .gitconfig /root/.gitconfig

WORKDIR /app

# Only the pruned lockfile + package.jsons. BuildKit keys `COPY --from` on file *content* (mtime
# excluded), so this layer stays cached across source-only edits even though `pruner` always reruns.
COPY --from=pruner /app/out/json/ ./
# pnpm has two caches: the store (package contents, plus the side-effects cache holding
# planx-core's `prepare` build output) and the metadata cache that --prefer-offline reads.
# Both are redirected onto BuildKit cache mounts so a cache miss here costs seconds, not minutes.
# Every pnpm command that touches the store must repeat these mounts, or it finds an empty dir
# and re-fetches from the network - hence the repetition below.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/pnpm/cache \
    npm_config_store_dir=/pnpm/store npm_config_cache_dir=/pnpm/cache \
    pnpm install --frozen-lockfile --prefer-offline

## SOURCE ##
# The pruned full source, shared by both targets
FROM base AS source
COPY --from=pruner /app/out/full/ ./

## PRODUCTION BUILD ##
# Split out of `base` so the development target never pays for a prod deploy it throws away
FROM source AS deploy-prod
# `...` includes api.planx.uk's workspace dependencies (e.g. @planx/file-upload), built first in
# topological order - a plain `--filter api.planx.uk build` would skip building them, since it
# bypasses Turborepo's `^build` dependency graph
RUN pnpm --filter api.planx.uk... build

# `pnpm deploy` refuses to run unless `inject-workspace-packages=true`, failing with ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE
# It's not exposed as a CLI flag, so we set it via npm's `npm_config_<key>` env-var convention
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/pnpm/cache \
    npm_config_store_dir=/pnpm/store npm_config_cache_dir=/pnpm/cache \
    npm_config_inject_workspace_packages=true \
    pnpm --filter api.planx.uk deploy --prod --prefer-offline /deploy/api

## PRODUCTION ##
FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /api

ENV NODE_ENV=production
COPY --from=deploy-prod /deploy/api ./
CMD ["npm", "start"]

## DEVELOPMENT ##
FROM source AS development
# NB must stay *after* the install in `base` - an earlier NODE_ENV=production would drop tsx and
# typescript from the install, breaking `pnpm watch`
ENV NODE_ENV=development

# `^...` selects api.planx.uk's workspace *dependencies* only, excluding the API itself.
# docker-compose.local.yml bind-mounts host source over /api and the CMD is `tsx watch index.ts`,
# so the API's own dist/ is masked and never read - building it here is pure waste.
# @planx/file-upload's dist IS needed: `inject-workspace-packages` copies it into /api/node_modules.
RUN pnpm --filter api.planx.uk^... build

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/pnpm/cache \
    npm_config_store_dir=/pnpm/store npm_config_cache_dir=/pnpm/cache \
    npm_config_inject_workspace_packages=true \
    pnpm --filter api.planx.uk deploy --prefer-offline /api
WORKDIR /api
CMD ["pnpm", "watch"]
