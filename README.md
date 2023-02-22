# Plan✕

Plan✕ is a platform for creating and publishing digital planning services. Learn more about how it's currently being used here: https://opendigitalplanning.org/

## Status pages

- Production: https://status.planx.uk
- Staging: https://status.planx.dev
- GIS & other data integrations: https://gis-status.planx.uk (ask for the password in Slack!)

## Our stack

planx-new is a monorepo containing our full application stack. Here's a quick summary of what you'll find here:

- `api.planx.uk` is a Node/Express server and REST endpoints
- `editor.planx.uk` is our React frontend, which consists of two main environments: an "editor" for service designers and a "preview" for public applicants. Our components are written with Material UI and broadly follow GOV.UK design patterns
- `hasura.planx.uk` is a [Hasura](https://hasura.io/) GraphQL engine for our PostgreSQL database
- `sharedb.planx.uk` is our implementation of [ShareDB](https://github.com/share/sharedb), a library for realtime document collaboration based on JSON Operational Transformation (OT) used in our "editor" environment
- `infrastructure` is [Pulumi](https://www.pulumi.com/) infrastructure-as-code for configuring and managing our AWS environments


## Running Locally

1. Download and install the following dependencies if you don't have them already:
- [Docker](https://docs.docker.com/get-docker/)
- [PNPM](https://github.com/pnpm/pnpm) `npm install -g pnpm@7.8.0`

1. Clone this repository. You'll need to get some additional environment variable files that aren't published here. Find instructions for copying these in 1password under the AWS Staging IAM user role entry

1. Run `pnpm install` from the root to install shared dependencies (the editor and api expect locally packaged dependencies)

1. Run `pnpm docker:up` from the project root to get everything (postgres, sharedb, api and hasura server processes) up and running and `pnpm docker:down` to stop all services. `pnpm docker:down-hard` will remove volumes (i.e. database data) and can be a useful hard reset when necessary.

1. Move into the hasura directory `cd ../hasura.planx.uk` & install dependencies `pnpm i`.

1. Open [Hasura's](https://hasura.io/) web console (`cd hasura.planx.uk` then `pnpm start`) & check that your Google email address is in the `users` table, if not then add it

1. Move into the editor directory `cd ../editor.planx.uk` & install dependencies `pnpm i`.

1. Start the editor dev server! `pnpm start` & open `http://localhost:3000` & login with your GMail/Google email address


### Troubleshooting

If you run into trouble, you may want to try the following:

* Ensure you have a local `.env` file with up-to-date keys etc (see relevant `.env.example` files for reference and 1Password for an initial `.env` file).


### Analytics

Running `docker compose up` won't spin up [Metabase](https://www.metabase.com/).
To spin it up, run:

  `docker compose --profile analytics up`


### Documentation

This project uses Architecture Decision Records (ADRs) to record significant changes and decisions. Further details of this can be [found here](https://github.com/theopensystemslab/planx-new/blob/main/doc/architecture/decisions/0001-record-architecture-decisions.md).

For maximum visibility and discoverability, we recommend using the [GitHub discussions board](https://github.com/theopensystemslab/planx-new/discussions) where possible.

## Deployments

Our `main` branch is deployed to AWS staging (editor.planx.dev) and `production` is deployed to our AWS production environment (i.e. editor.planx.uk and the custom subdomain like planningservices.{council}.gov.uk) using Github Actions.

We work in feature branches and open pull requests against `main`. Pull requests will spin up a Vultr server running Docker to test the whole stack (eg database migrations, API changes, frontend changes, Storybook, etc) and generate unique links that can be shared for user-acceptance tesing. Pull request environments use the domain pattern `<service>.<PR#>.planx.pizza` and are often simply referred to as "pizzas". The only changes which cannot be fully tested on a pizza are changes related to Pulumi infrastructure-as-code because this is only deployed in AWS environments, not via Docker.

Pull requests will automatically deploy to a new pizza. To skip pizza deployments, include `[skip pizza]` anywhere in your commit message.

We aim to keep a linear commit history between `main` and `production` branches in Github. We "Squash & merge" pull request commits into `main`.

(EDIT: Automatic deployments are on pause and planned to resume after the holidays) Automatic production deployments happen every Tuesday, Wednesday, Thursday, and Friday at 9am, at which time `main` is pushed to `production` (which triggers a deployment).

You can manually trigger a production deployments by going to [the Deploy to Production](https://github.com/theopensystemslab/planx-new/actions/workflows/cron-deploy-to-production.yml) action and clicking `Run workflow`.

Once a deployment is completed, a Slack notification will be sent to the #planx-deployments channel, and the `production` branch should read "This branch is up to date with main."


### Troubleshooting

If the commit history of `main` and `production` diverge and `production` contains commit hashes that are NOT on main, try running this command from `production` to reset and then follow the original deploy steps above:
```bash
git reset --hard <most recent commit hash **matching** main> && git push --force
```

You'll have to temporarily turn off branch protection rules to make this change, so run it by another dev to confirm.

## Audits

### Accessibility

Our public-facing live services were last audited by the [Digital Accessibility Centre (DAC)](https://digitalaccessibilitycentre.org/) on 30th March 2022. At that time we were found to comply with all the requirements of the [Web Content Accessibility Guidelines (WCAG) version 2.1 AA](https://www.w3.org/TR/WCAG21/). You can [review our report here](https://drive.google.com/file/d/1bg3UvRq80H0R59avKpBAuQL1jxKG5tRZ/view).

### Security

Our whole stack was last assessed by [Jumpsec](https://www.jumpsec.com/) on 27th July 2022. Their penetration test concluded that our infrastructure and application environments are securely configured to follow best practices. We have since additionally resolved a handful of low- and informational-risk issues uncovered during the assessment to maintain a high standard of security.
