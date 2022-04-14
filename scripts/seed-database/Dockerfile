FROM node:16.13.1-alpine 
RUN npm install -g hasura-cli

WORKDIR /scripts/
RUN npm install -g pnpm
COPY pnpm-lock.yaml .

RUN pnpm fetch --prod
ADD . .
RUN pnpm install -f --recursive --offline --prod
COPY . .
CMD ["sh", "./seed-db.sh"]

