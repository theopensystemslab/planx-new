# PlanX

## https://editor.planx.uk

### Running Locally

1. [Download and install Docker](https://docs.docker.com/get-docker/) if you don't have it already

2. Run the following command to get everything (postgres, sharedb, api and hasura server processes) up and running `docker-compose up --build -d`

3. Install [pnpm](https://github.com/pnpm/pnpm) if you don't have it `npm install -g pnpm`

4. Move into the editor directory `cd editor.planx.uk`

5. Seed the database

6. Start the dev server! `pnpm start`, open http://localhost:3000 and login with Google
