## BASE ##
# 16.13.1 = LTS (outdated: LTS is now node 18)
FROM node:16.13.1-alpine as base

RUN apk add --no-cache git # required for fetching git dependencies

WORKDIR /api
RUN npm install -g pnpm@7.27.0

# install cachable shared package
COPY shared ./shared
RUN pnpm install ./shared/planx-client*
RUN cd node_modules/planx-client && pnpm install && pnpm build

# update package cache using lockfile
# see https://pnpm.io/cli/fetch
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# copy and install everything else using cache where possible
COPY . ./
RUN pnpm install --recursive --prefer-offline

RUN pnpm build
RUN pnpm prune --production

FROM node:16.13.1-alpine as production
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
