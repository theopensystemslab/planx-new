FROM node:14.4.0-alpine as base

WORKDIR /api
RUN npm install -g pnpm
COPY pnpm-lock.yaml .
EXPOSE 4000

FROM base as production
ENV NODE_ENV production
# see https://pnpm.io/cli/fetch
RUN pnpm fetch --prod
ADD . .
RUN pnpm install --recursive --offline --prod
RUN pnpm build
COPY . .
CMD ["pnpm", "start"]

FROM base as development
ENV NODE_ENV development
RUN pnpm fetch
ADD . .
RUN pnpm install --recursive --offline
COPY . .
CMD ["pnpm", "dev"]
