FROM node:14.4.0-alpine

ENV ENV_NAME production
ENV NODE_ENV production
ENV NODE_CONFIG_ENV production

WORKDIR /api

ENV PATH /api/node_modules/.bin:$PATH

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

CMD ["yarn", "start"]
