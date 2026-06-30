FROM node:24.14.0-alpine AS base

# Git required for planx-core github dependency
RUN apk add --no-cache git
COPY .gitconfig /root/.gitconfig

WORKDIR /app
RUN npm install -g pnpm@10.30.2

# Fetch before copying source to maximise layer cache reuse
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
RUN pnpm fetch

COPY . .
RUN pnpm install --frozen-lockfile --prefer-offline
# `pnpm deploy` refuses to run unless `inject-workspace-packages=true`, failing with ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE
# It's not exposed as a CLI flag, so we set it via npm's `npm_config_<key>` env-var convention
RUN npm_config_inject_workspace_packages=true pnpm --filter sharedb.planx.uk deploy --prod --prefer-offline /deploy/sharedb

## PRODUCTION ##
FROM node:24.14.0-alpine AS production
WORKDIR /sharedb
ENV NODE_ENV=production
COPY --from=base /deploy/sharedb ./
CMD ["node", "server.js"]


## DEVELOPMENT ##
FROM base AS development
ENV NODE_ENV=development
RUN npm_config_inject_workspace_packages=true pnpm --filter sharedb.planx.uk deploy --prefer-offline /sharedb
WORKDIR /sharedb
CMD ["pnpm", "dev"]
