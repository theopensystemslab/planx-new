FROM node:16.13.1-alpine as base

WORKDIR /scripts/
RUN npm install -g pnpm
COPY pnpm-lock.yaml .

RUN pnpm fetch --prod
ADD . .
RUN pnpm install -f --recursive --offline --prod
COPY . .
CMD ["pnpm", "upsert-flows"]
