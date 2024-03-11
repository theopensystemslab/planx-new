# Plan✕

Plan✕ is a platform for creating and publishing digital planning services.

Learn more about how it's currently being used here: https://opendigitalplanning.org/

Explore our component library and design system here: https://storybook.planx.uk/

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

## Running locally

1. Download and install the following dependencies if you don't have them already:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [PNPM](https://github.com/pnpm/pnpm) `npm install -g pnpm@8.6.6`
- [Node](https://nodejs.org/en/download) `pnpm env use --global 18.16.1`
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

**If you're an OSL developer:**

1. Clone this repository

2. Setup your AWS CLI client with SSO - [detailed guide here](https://github.com/theopensystemslab/planx-new/blob/main/doc/how-to/how-to-setup-aws-sso-credentials.md)

3. Pull down environment secrets for running the application in staging mode by running `./scripts/pull-secrets.sh`. (NOTE: Even when running locally, API requests are routed to relevant staging servers and emails are actually processed and sent to provided addresses).

4. Run `pnpm run up` from the project root to set up docker containers for the application's backend (postgres, sharedb, api and hasura server processes) and to pull seed application data from production.

5. Move into the hasura directory `cd ../hasura.planx.uk` and install dependencies `pnpm i`.

6. Open [Hasura's](https://hasura.io/) web console (`cd hasura.planx.uk` then `pnpm start`) and check that your Google email address is in the `users` table, if not then add it. This will eventually allow you to authenticate into the application as an admin.

7. Move into the editor directory `cd ../editor.planx.uk` & install dependencies `pnpm i`.

8. Start the editor dev server, with `pnpm start`

9. Open `http://localhost:3000` and login with your Google email address

**If you're not a member of OSL, follow these steps:**

1. Fork or clone this repository

2. Copy all `.example` env files into their respective directories and replace 👻 with a string like "SECRET" or longer where noted

3. Setup free OAuth Client ID credentails in the [Google Cloud APIs console](https://console.cloud.google.com/apis/credentials)

- Application type = "Web application"
- Authorised JavaScript origins = "http://localhost:3000"
- Authorised redirect URIs = "http://localhost:7002/auth/google/callback"
- Update the `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` env vars with your new credentials

4. Run `pnpm start` from the project root to set up docker containers for the application's backend (postgres, sharedb, api and hasura server processes). Please note you will not be able to run commands that sync seed data from production.

5. Move into the hasura directory `cd ../hasura.planx.uk` and install dependencies `pnpm i`.

6. Open [Hasura's](https://hasura.io/) web console (`cd hasura.planx.uk` then `pnpm start`) and add your Google email address to the `users` table. You'll also likely want to create an initial `team`. This will eventually allow you to authenticate into the application as an admin.

7. Follow steps 7-9 above to start the editor and login !

At this point you'll be running the full Planx application locally in a docker container. See our Github Actions pull request workflow as an example of how to deploy via docker to a virtual linux server, or explore the `infrastructure` directory for how to deploy via Pulumi infrastructure-as-code to AWS.

We'd love to hear what you're building on Planx, don't hesitate to get in touch with questions.

### Docker

The root of the project has several scripts set up to help you manage your docker containers:

- `pnpm run up` alias for `pnpm recreate && pnpm add-data`
- `pnpm run down` alias for `pnpm destroy`
- `pnpm run restart` alias for `pnpm stop && pnpm start`
- `pnpm start` will (re)create docker containers without rebuilding them
- `pnpm stop` will stop your docker containers without destroying them
- `pnpm recreate` will build and (re)start your docker containers from scratch.
- `pnpm destroy` will remove volumes (i.e. database data) and can be a useful hard reset when necessary.
- `pnpm add-data` will sync production records with modified data in your database
- `pnpm clean-data` will sync production records and reset any modified data
- `pnpm tests` will recreate your docker containers and include test services
- `pnpm analytics` will recreate your docker containers and include [Metabase](https://www.metabase.com/)
- `pnpm logs` will print docker log entries (this can be filtered by appending `-- [service name]`, for example `pnpm logs -- api`)

### Documentation

This project uses Architecture Decision Records (ADRs) to record significant changes and decisions. Further details of this can be [found here](https://github.com/theopensystemslab/planx-new/blob/main/doc/architecture/decisions/0001-record-architecture-decisions.md).

For maximum visibility and discoverability, we recommend using the [GitHub discussions board](https://github.com/theopensystemslab/planx-new/discussions) where possible.

## Deployments

Our `main` branch is deployed to AWS staging (editor.planx.dev) and `production` is deployed to our AWS production environment (i.e. editor.planx.uk and the custom subdomain like planningservices.{council}.gov.uk) using Github Actions.

We work in feature branches and open pull requests against `main`. Pull requests will spin up a Vultr server running Docker to test the whole stack (eg database migrations, API changes, frontend changes, Storybook, etc) and generate unique links that can be shared for user-acceptance tesing. Pull request environments use the domain pattern `<service>.<PR#>.planx.pizza` and are often simply referred to as "pizzas". The only changes which cannot be fully tested on a pizza are changes related to Pulumi infrastructure-as-code because this is only deployed in AWS environments, not via Docker.

Pull requests will automatically deploy to a new pizza. To skip pizza deployments, include `[skip pizza]` anywhere in your commit message.

We aim to keep a linear commit history between `main` and `production` branches in Github. We "Squash & merge" pull request commits into `main`.

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

Our whole stack was last assessed by [Jumpsec](https://www.jumpsec.com/) between the 21st and 30th November 2023. JUMPSEC then performed a retest of the issues identified in the initial test on the 8th of February 2024. This included verifying that fixes had been successfully applied and that no further risks were introduced as a result of the remediation work carried out. Their penetration test concluded that - "the security posture of PlanX was strong, and following industry best practices. JUMPSEC commend the PlanX team on their dedication to security and ability to both maintain and mitigate issues in a responsible and timely manner". You can [review our report here](https://file.notion.so/f/f/d2306134-7ae0-417c-8db3-cdd87c524efa/ab940248-ca60-49a3-bfae-0b6faa916b1e/2024-02-13_JUMPSEC_Lambeth_PlanX_Web_Application_Assessment_Report_v2.0.pdf?id=aa4ed144-4b48-4a88-9693-6a3644bfd6cf&table=block&spaceId=d2306134-7ae0-417c-8db3-cdd87c524efa&expirationTimestamp=1707998400000&signature=76AfnXjSTzw8O5TEW9Ao0mOmWTG4WzE8rm-Rfa54wGU&downloadName=Penetration+test+%28Jumpsec%29+13%2F02%2F24.pdf).

## Related packages

There are a few dependent packages that are closely related to this project:

- https://github.com/theopensystemslab/planx-core
- https://github.com/theopensystemslab/map
- https://github.com/theopensystemslab/digital-planning-data-schemas
