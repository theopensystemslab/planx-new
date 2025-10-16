# 22.14.0 = LTS
FROM node:22.14.0-alpine AS base

WORKDIR /planx-new
RUN npm install -g pnpm@10.10.0

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
RUN pnpm fetch

COPY packages ./packages
COPY apps/sharedb.planx.uk ./apps/sharedb.planx.uk

RUN pnpm install --recursive --prefer-offline

RUN pnpm --filter sharedb --prod deploy /pruned

## PRODUCTION ##
FROM node:22.14.0-alpine AS production

ENV NODE_ENV=production
COPY --from=base /pruned ./
CMD ["pnpm", "start"]

## DEVELOPMENT ##
FROM base AS development
WORKDIR /planx-new/apps/sharedb.planx.uk
ENV NODE_ENV=development
CMD ["pnpm", "--filter", "sharedb", "dev"]