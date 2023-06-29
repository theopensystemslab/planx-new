# 18.16.1 = LTS
FROM node:18.16.1-alpine as base

WORKDIR /sharedb
RUN npm install -g pnpm@7.8.0
COPY pnpm-lock.yaml .

FROM base as production
ENV NODE_ENV production
# see https://pnpm.io/cli/fetch
RUN pnpm fetch --prod
ADD . .
RUN pnpm install --recursive --offline --prod
COPY . .
CMD ["pnpm", "start"]

FROM base as development
ENV NODE_ENV development
RUN pnpm fetch
ADD . .
RUN pnpm install --recursive --offline
COPY . .
CMD ["pnpm", "dev"]
