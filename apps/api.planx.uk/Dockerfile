## BASE ##
# 22.14.0 = LTS
FROM node:22.14.0-alpine AS base

# Setup Git - required for fetching git dependencies (planx-core)
RUN apk add --no-cache git 
COPY .gitconfig /planx-new/.gitconfig

WORKDIR /planx-new
RUN npm install -g pnpm@10.10.0

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .gitconfig ./
RUN pnpm fetch

COPY packages ./packages
COPY apps/api.planx.uk ./apps/api.planx.uk

RUN pnpm install --recursive --prefer-offline

RUN pnpm --filter api build

RUN pnpm --filter api --prod deploy /pruned

## PRODUCTION ##
FROM node:22.14.0-alpine AS production
ENV NODE_ENV=production
COPY --from=base /pruned ./
CMD ["npm", "start"]

## DEVELOPMENT ##
FROM base AS development
WORKDIR /planx-new/apps/api.planx.uk
ENV NODE_ENV=development
CMD ["pnpm", "--filter", "api", "dev"]