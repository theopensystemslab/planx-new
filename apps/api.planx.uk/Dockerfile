## BASE ##
# "base" contains the full monorepo and dev dependencies
# 22.14.0 = LTS
FROM node:22.14.0-alpine AS base

# Setup Git - required for fetching git dependencies (planx-core)
RUN apk add --no-cache git 
COPY .gitconfig /planx-new/.gitconfig

WORKDIR /planx-new
RUN npm install -g pnpm@10.10.0

# Install dependencies first
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
RUN pnpm fetch

# Copy the rest of the source code
COPY packages ./packages
COPY apps/api.planx.uk ./apps/api.planx.uk

# Install and build
RUN pnpm install --recursive --prefer-offline
RUN pnpm --filter api build

# Use pnpm to "prune" a single app for production
# Docs: https://pnpm.io/cli/deploy
RUN mkdir pruned
RUN pnpm --filter api --prod deploy pruned

## PRODUCTION ##
FROM node:22.14.0-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy only the pruned app files from the base stage
COPY --from=base /planx-new/pruned .
CMD ["npm", "start"]

## DEVELOPMENT ##
FROM base AS development
WORKDIR /planx-new/apps/api.planx.uk
ENV NODE_ENV=development
CMD ["pnpm", "--filter", "api", "dev"]