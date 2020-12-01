# PlanX

## https://editor.planx.uk

[![Netlify Status](https://api.netlify.com/api/v1/badges/5856b13f-3fad-44ec-ae6c-2c6502df1356/deploy-status)](https://app.netlify.com/sites/planx-new/deploys)

### Running Locally

1. [Download and install Docker](https://docs.docker.com/get-docker/) if you don't have it already

2. Run the following command to get everything (postgres, sharedb, api and hasura server processes) up and running `docker-compose up --build -d`

3. Install [pnpm](https://github.com/pnpm/pnpm) if you don't have it `npm install -g pnpm`

4. Move into the editor directory `cd editor.planx.uk`

5. Seed the database

6. Start the dev server! `pnpm start`, open http://localhost:3000 and login with Google

## https://storybook.planx.uk

[![Netlify Status](https://api.netlify.com/api/v1/badges/59207299-9639-463c-b983-e78a4485e45b/deploy-status)](https://app.netlify.com/sites/planx-storybook/deploys)
