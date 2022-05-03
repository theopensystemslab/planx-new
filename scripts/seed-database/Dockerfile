FROM node:16.13.1-alpine 
RUN npm install -g hasura-cli

WORKDIR /scripts/
RUN npm install -g pnpm@6.24.1
COPY pnpm-lock.yaml .

RUN pnpm fetch --prod
ADD . .
RUN pnpm install -f --recursive --offline --prod
COPY . .
CMD ["sh", "./seed-db.sh"]

