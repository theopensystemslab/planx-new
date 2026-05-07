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
RUN pnpm --filter api.planx.uk build
RUN npm_config_inject_workspace_packages=true pnpm --filter api.planx.uk deploy --prod --prefer-offline /deploy/api


FROM node:24.14.0-alpine AS production
WORKDIR /api

## PRODUCTION ##
ENV NODE_ENV=production
COPY --from=base /deploy/api ./
CMD ["npm", "start"]

## DEVELOPMENT ##
FROM base AS development
ENV NODE_ENV=development
RUN npm_config_inject_workspace_packages=true pnpm --filter api.planx.uk deploy --prefer-offline /api
WORKDIR /api
CMD ["pnpm", "dev"]
