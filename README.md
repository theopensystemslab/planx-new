# Plan✕

Plan✕ is a platform for creating and publishing digital planning services. Learn more about how it's currently being used here: https://www.ripa.digital/

## Status pages

- Production: https://status.planx.uk
- GIS & other data integrations: https://gis-status.planx.uk (ask for the password in Slack!)

## Our stack

planx-new is a monorepo containing our full application stack. Here's a quick summary of what you'll find here:

- `api.planx.uk` is a Node/Express server and REST endpoints 
- `editor.planx.uk` is our React frontend, which consists of two main environments: an "editor" for service designers and a "preview" for public applicants. Our components are written with Material UI and follow GOV.UK design patterns
- [`hasura.planx.uk`](https://hasura.io/) is a GraphQL engine for our PostgreSQL database
- [`sharedb.planx.uk`](https://github.com/share/sharedb) is a library for realtime document collaboration based on JSON Operational Transformation (OT) used in our "editor" environment
- `infrastructure` is [Pulumi](https://www.pulumi.com/) infrastructure-as-code for configuring and managing our AWS environments

## Running Locally

1. [Download and install Docker](https://docs.docker.com/get-docker/) if you don't have it already

1. Clone this repository. You'll need to get some additional environment variable files that aren't published here. Find instructions for copying those in 1password under the AWS Staging IAM user role entry.

1. Run the following command to get everything (postgres, sharedb, api and hasura server processes) up and running `docker-compose up --build -d`

1. Open [Hasura's](https://hasura.io/) web console to check that your Google email address is in the users table, if not then add it

1. Move into the editor directory `cd ../editor.planx.uk`

1. Install [pnpm](https://github.com/pnpm/pnpm) if you don't have it `npm install -g pnpm@7.8.0`

1. Install dependencies `pnpm i`

1. Start the dev server! `pnpm start`, open http://localhost:3000 and login with your GMail/Google email address

### Analytics

Running `docker-compose up` won't spin up [metabase](https://www.metabase.com/).
To spin it up, run:

  `docker-compose --profile analytics up`


### Documentation

This project uses Architecture Decision Records (ADRs) to record significant changes and decisions. Further details of this can be (found here)[https://github.com/theopensystemslab/planx-new/blob/main/doc/architecture/decisions/0001-record-architecture-decisions.md].

For maximum visibility and discoverability, we recommend using the (GitHub discussions board)[https://github.com/theopensystemslab/planx-new/discussions] where possible.
