# 16.13.1 = LTS
FROM node:16.13.1-alpine as base

WORKDIR /api
RUN npm install -g pnpm@7.8.0

ADD . .

RUN pnpm fetch
# see https://pnpm.io/cli/fetch
RUN pnpm install --recursive --offline
RUN pnpm build
RUN pnpm prune --production

COPY . .

FROM node:16.13.1-alpine as production
WORKDIR /api
ENV NODE_ENV production

COPY --from=base /api/package.json ./package.json
COPY --from=base /api/dist ./dist
COPY --from=base /api/node_modules ./node_modules

CMD ["npm", "start"]

FROM base as development
ENV NODE_ENV development

ADD . .

RUN pnpm fetch
RUN pnpm install --recursive --offline -f
COPY . .

CMD ["pnpm", "dev"]
