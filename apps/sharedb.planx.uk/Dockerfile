# syntax=docker/dockerfile:1.20
ARG NODE_VERSION=24.14.1

## TOOLCHAIN ##
# Shared node+pnpm layer, reused by every stage below
FROM node:${NODE_VERSION}-alpine AS toolchain
RUN npm install -g pnpm@10.30.2

## PRUNE ##
# Produce a pruned monorepo containing only sharedb.planx.uk. Without this the install below is a
# *full monorepo* install (the editor's entire React/MUI tree included), invalidated by any source
# change anywhere in the build context - sharedb has no workspace deps, so its pruned install is tiny
FROM toolchain AS pruner
WORKDIR /app
RUN npm install -g turbo@2.10.2
COPY . .
RUN turbo prune sharedb.planx.uk --docker

## BASE ##
FROM toolchain AS base

# Insurance only: planx-core's catalog spec currently resolves to a codeload tarball in the
# lockfile, so no clone happens under --frozen-lockfile - but a branch/ssh spec would need git again
RUN apk add --no-cache git
COPY .gitconfig /root/.gitconfig

WORKDIR /app

# Only the pruned lockfile + package.jsons. BuildKit keys `COPY --from` on file *content* (mtime
# excluded), so this layer stays cached across source-only edits even though `pruner` always reruns.
COPY --from=pruner /app/out/json/ ./
# pnpm's store and metadata caches are redirected onto BuildKit cache mounts, so a cache miss here
# costs seconds rather than re-downloading every tarball. Every pnpm command that touches the store
# must repeat these mounts, or it finds an empty dir and re-fetches from the network.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/pnpm/cache \
    npm_config_store_dir=/pnpm/store npm_config_cache_dir=/pnpm/cache \
    pnpm install --frozen-lockfile --prefer-offline

COPY --from=pruner /app/out/full/ ./

## PRODUCTION BUILD ##
# Split out of `base` so the development target never pays for a prod deploy it throws away
FROM base AS deploy-prod
# `pnpm deploy` refuses to run unless `inject-workspace-packages=true`, failing with ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE
# It's not exposed as a CLI flag, so we set it via npm's `npm_config_<key>` env-var convention
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/pnpm/cache \
    npm_config_store_dir=/pnpm/store npm_config_cache_dir=/pnpm/cache \
    npm_config_inject_workspace_packages=true \
    pnpm --filter sharedb.planx.uk deploy --prod --prefer-offline /deploy/sharedb

## PRODUCTION ##
FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /sharedb
ENV NODE_ENV=production
COPY --from=deploy-prod /deploy/sharedb ./
CMD ["node", "server.js"]


## DEVELOPMENT ##
# NB docker-compose.local.yml does not override sharedb's target, so local dev builds `production`
FROM base AS development
ENV NODE_ENV=development
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/pnpm/cache \
    npm_config_store_dir=/pnpm/store npm_config_cache_dir=/pnpm/cache \
    npm_config_inject_workspace_packages=true \
    pnpm --filter sharedb.planx.uk deploy --prefer-offline /sharedb
WORKDIR /sharedb
CMD ["pnpm", "dev"]
