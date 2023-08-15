## BASE ##
# 18.16.1 = LTS
FROM node:18.16.1-alpine as base

# Setup Git - required for fetching git dependencies (planx-core)
RUN apk add --no-cache git 
COPY .gitconfig /root/.gitconfig

WORKDIR /api
RUN npm install -g pnpm@8.6.6

# update package cache using lockfile
# see https://pnpm.io/cli/fetch
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# copy and install everything else using cache where possible
COPY . ./
RUN pnpm install --recursive --prefer-offline

RUN pnpm build
RUN pnpm prune --production

FROM node:18.16.1-alpine as production
WORKDIR /api

## PRODUCTION ##
ENV NODE_ENV production
COPY --from=base /api/package.json ./package.json
COPY --from=base /api/dist ./dist
COPY --from=base /api/node_modules ./node_modules
CMD ["npm", "start"]

## DEVELOPMENT ##
FROM base as development
ENV NODE_ENV development
# reinstall pruned development dependencies
RUN pnpm install --development
CMD ["pnpm", "dev"]
