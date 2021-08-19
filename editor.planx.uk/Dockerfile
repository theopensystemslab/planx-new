FROM node:14.4.0-alpine AS install

WORKDIR /editor

RUN npm i -g pnpm

ENV ENV_NAME development
ENV NODE_ENV development
ENV NODE_CONFIG_ENV development

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install

COPY . .

RUN pnpm build

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=install /editor/build .
EXPOSE 8043
ENTRYPOINT ["/goStatic", "--fallback", "/index.html"]
