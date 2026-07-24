## PRUNE ##
# Produce a pruned monorepo containing only api.planx.uk + its workspace dependencies
FROM node:24.14.0-alpine AS pruner
WORKDIR /app
RUN npm install -g pnpm@10.30.2 turbo@2.10.2
COPY . .
RUN turbo prune api.planx.uk --docker

## BASE ##
FROM node:24.14.0-alpine AS base

# Git required for planx-core github dependency
RUN apk add --no-cache git
COPY .gitconfig /root/.gitconfig

WORKDIR /app
RUN npm install -g pnpm@10.30.2

# Install from the pruned lockfile + package.jsons only. This layer is cached
# unless the API's dependencies change (not on every monorepo source change).
COPY --from=pruner /app/out/json/ ./
RUN pnpm fetch
RUN pnpm install --frozen-lockfile --prefer-offline

# Build from the pruned full source
COPY --from=pruner /app/out/full/ ./
RUN pnpm --filter api.planx.uk build
# `pnpm deploy` refuses to run unless `inject-workspace-packages=true`, failing with ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE
# It's not exposed as a CLI flag, so we set it via npm's `npm_config_<key>` env-var convention
RUN npm_config_inject_workspace_packages=true pnpm --filter api.planx.uk deploy --prod --prefer-offline /deploy/api

## PRODUCTION ##
FROM node:24.14.0-alpine AS production
WORKDIR /api

ENV NODE_ENV=production
COPY --from=base /deploy/api ./
CMD ["npm", "start"]

## DEVELOPMENT ##
FROM base AS development
ENV NODE_ENV=development

RUN npm_config_inject_workspace_packages=true pnpm --filter api.planx.uk deploy --prefer-offline /api
WORKDIR /api
CMD ["pnpm", "dev"]
