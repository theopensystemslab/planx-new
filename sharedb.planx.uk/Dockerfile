# 22.10.0 = LTS
FROM node:22.10.0-alpine AS base

WORKDIR /sharedb
RUN npm install -g pnpm@8.6.6
COPY pnpm-lock.yaml .

FROM base AS production
ENV NODE_ENV production
# see https://pnpm.io/cli/fetch
RUN pnpm fetch --prod
ADD . .
RUN pnpm install --recursive --offline --prod
COPY . .
CMD ["pnpm", "start"]

FROM base AS development
ENV NODE_ENV development
RUN pnpm fetch
ADD . .
RUN pnpm install --recursive --offline
COPY . .
CMD ["pnpm", "dev"]
