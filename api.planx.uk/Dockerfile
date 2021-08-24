FROM node:14.4.0-alpine as base

WORKDIR /api
RUN npm install -g pnpm
COPY package.json .
COPY pnpm-lock.yaml .
EXPOSE 4000

FROM base as production
ENV NODE_ENV production
RUN pnpm i --frozen
RUN pnpm build
COPY . .
CMD ["pnpm", "start"]

FROM base as development
ENV NODE_ENV development
RUN pnpm i
COPY . .
CMD ["pnpm", "dev"]
