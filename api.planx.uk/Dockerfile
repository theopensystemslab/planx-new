## BASE ##
# 22.14.0 = LTS
FROM node:22.14.0-alpine AS base

# Setup Git - required for fetching git dependencies (planx-core)
RUN apk add --no-cache git 
COPY .gitconfig /root/.gitconfig

WORKDIR /api
RUN npm install -g pnpm@10.10.0

# update package cache using lockfile
# see https://pnpm.io/cli/fetch
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# copy and install everything else using cache where possible
COPY . ./
RUN pnpm install --recursive --prefer-offline

RUN pnpm build
RUN pnpm prune --production

FROM node:22.14.0-alpine AS production
WORKDIR /api

## PRODUCTION ##
ENV NODE_ENV=production
COPY --from=base /api/package.json ./package.json
COPY --from=base /api/dist ./dist
COPY --from=base /api/node_modules ./node_modules
CMD ["npm", "start"]

## DEVELOPMENT ##
FROM base AS development
ENV NODE_ENV=development
RUN pnpm install
CMD ["pnpm", "dev"]
