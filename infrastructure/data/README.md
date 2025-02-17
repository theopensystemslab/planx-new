# Deploying the data layer

The data layer manages configurations for our AWS RDS Postgres database. This layer is manually managed and never automatically deployed via CI.

## Steps
1. Export the AWS profile credentials for `planx-staging-pulumi` in your active terminal `export AWS_REGION=eu-west-2 && export AWS_ACCESS_KEY_ID=xxx && export AWS_SECRET_ACCESS_KEY=xxx`
1. Run `pulumi refresh --stack <staging | production>`
  - This command compares our local `infrastructure/data/index.ts` state against the actual state in AWS and will highlight diffs which should ideally match the code changes, but may include out of sync configurations
1. Run `pulumi up --stack <staging | production>`
1. Confirm success/"available" status and new configurations in AWS RDS console

## General prep for major Postgres version upgrades
- Ensure that other parts of our stack are compatible with the Postgres target version (Hasura, ShareDB, Metabase)
- Upgrade Docker images to test on local & pizza environments
- Bump the Pulumi `engineVersion` to an available upgrade target; test first on staging
- Plan to upgrade any Postgres extensions via a Hasura migration separately upon completion
- Review our database restore process

## Gotchas and resources
- Despite having a `[planx-staging-pulumi]` profile correctly configured in `~/.aws/credentials`, Pulumi commands incorrectly tried to use the `docker-user`. Manually exporting the variables was an easy resolution, but a finicky one to troubleshoot & make sense of!
- AWS automatically applies minor versions inbetween manual data layer deployments for major upgrades. This meant that despite our Pulumi `index.ts` having `engineVersion: 12.17`, our actual RDS instance was on version `12.19` and therefore had different available upgrade targets (16.3 instead of 16.1)
