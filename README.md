# PlanX

## Running Locally

First you want to run the postgres, sharedb, api and hasura server processes locally

`docker-compose up --build`

then open another terminal window.

You probably want to seed the database, edit the file in `hasura.planx.uk/seeds/1595528762802_teams_and_users.sql` and replace `test@example.com` with a google email address that you have access to (currently required for OAuth). Save the file, ensure you have installed the [hasura CLI](https://hasura.io/docs/1.0/graphql/manual/hasura-cli/install-hasura-cli.html) and run `cd hasura.planx.uk && hasura seeds apply`.

Now you can start the editor (React App)

`cd ../editor.planx.uk`

`yarn start`

and open http://localhost:3000 to login.
