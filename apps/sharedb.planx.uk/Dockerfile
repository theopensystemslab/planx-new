## BASE ##
# "base" contains the full monorepo and dev dependencies
# 22.14.0 = LTS
FROM node:22.14.0-alpine AS base

WORKDIR /planx-new
RUN npm install -g pnpm@10.10.0

# Install dependencies first
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
RUN pnpm fetch

# Copy the rest of the source code
COPY packages ./packages
COPY apps/sharedb.planx.uk ./apps/sharedb.planx.uk

# Install
RUN pnpm install --recursive --prefer-offline

# Use pnpm deploy to create production output
RUN mkdir pruned
RUN pnpm --filter sharedb.planx.uk --prod deploy --legacy pruned

## PRODUCTION ##
FROM node:22.14.0-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy only the pruned app files from the base stage
COPY --from=base /planx-new/pruned .
CMD ["pnpm", "start"]

## DEVELOPMENT ##
FROM base AS development
WORKDIR /planx-new/apps/sharedb.planx.uk
ENV NODE_ENV=development
CMD ["pnpm", "--filter", "sharedb.planx.uk", "dev"]