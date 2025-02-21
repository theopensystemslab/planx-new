# Deploying the data layer

The data layer manages configurations for our AWS RDS Postgres database. This layer is manually managed and never automatically deployed via CI.

## Steps
1. Export the AWS profile credentials for `planx-staging-pulumi` in your active terminal `export AWS_REGION=eu-west-2 && export AWS_ACCESS_KEY_ID=xxx && export AWS_SECRET_ACCESS_KEY=xxx`
1. Run `pulumi refresh --stack <staging | production>`
  - This command compares our local `infrastructure/data/index.ts` state against the actual state in AWS and will highlight diffs which should ideally match the code changes, but may include out of sync configurations
1. Run `pulumi up --stack <staging | production>`
1. Confirm success/"available" status and new configurations in AWS RDS console

## General prep for major Postgres version upgrades
- Ensure that other parts of our stack are compatible with the Postgres target version (Hasura, ShareDB (SSL configs), Metabase)
- Upgrade Docker images to test on local & pizza environments
- Bump the Pulumi `engineVersion` to an available upgrade target; test first on staging
- Run a few `EXPLAIN ANALYZE` queries before and after to spotcheck performance
- Plan to upgrade any Postgres extensions via a Hasura migration separately upon completion
- Review our database restore process

** In February 2025 when we upgraded from 12.19 to 16.3, the upgrade took ~10 minutes total with about ~3 minutes of downtime in the middle where the application was inaccessible. We completed this at a low traffic time and did not turn on Cloudflare "maintenance mode", but this may be worth considering in the future.

## Gotchas and resources
- Despite having a `[planx-staging-pulumi]` profile correctly configured in `~/.aws/credentials`, Pulumi commands incorrectly tried to use the `docker-user`. Manually exporting the variables was an easy resolution, but a finicky one to troubleshoot & make sense of!
- AWS automatically applies minor versions inbetween manual data layer deployments for major upgrades. This meant that despite our Pulumi `index.ts` having `engineVersion: 12.17`, our actual RDS instance was on version `12.19` and therefore had different available upgrade targets (16.3 instead of 16.1)
- On one upgrade attempt, we experienced the error `Database instance is in a state that cannot be upgraded: Postgres cluster is in a state where pg_upgrade can not be completed successfully.`
  - The upgrade attempt still completed on it's own in the usual time; the Pulumi command does not _fail_, it simply doesn't _change_ anything. 
    - The error was visible in the logs a few minutues in and we did _not_ have take any extra actions. There was still minimal service downtime in the middle, but other containers in the stack automatically restarted themselves to a healthy state as expected
  - The error was ultimately because we had pending "maintenance tasks"; we adjusted those to apply overnight and our upgrade the next day succeeded as expected. [This article](https://repost.aws/knowledge-center/rds-postgresql-version-upgrade-issues) had a number of helpful pointers for debugging this error
