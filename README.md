# PlanX

## https://editor.planx.uk

### Running Locally

1. [Download and install Docker](https://docs.docker.com/get-docker/) if you don't have it already

1. Run the following command to get everything (postgres, sharedb, api and hasura server processes) up and running `docker-compose up --build -d`

1. Install [pnpm](https://github.com/pnpm/pnpm) if you don't have it `npm install -g pnpm`

1. Move into the hasura directory `cd hasura.planx.uk`

1. Install [hasura-cli](https://hasura.io/docs/latest/graphql/core/hasura-cli/index.html) if you don't have it `npm install -g hasura-cli`

1. Seed the database

   `hasura seeds apply`

1. Apply migrations

   `hasura migrate apply`

1. Start the database console & graphiql at http://localhost:9695

   `hasura console`

1. Move into the editor directory `cd editor.planx.uk`

1. Start the dev server! `pnpm start`, open http://localhost:3000 and login with Google
