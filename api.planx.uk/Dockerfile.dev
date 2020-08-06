FROM node:14.4.0-alpine

ENV ENV_NAME development
ENV NODE_ENV development
ENV NODE_CONFIG_ENV development

WORKDIR /api

ENV PATH /api/node_modules/.bin:$PATH

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

CMD ["yarn", "dev"]
