# Deploying the data layer

The data layer manages configurations for our AWS RDS Postgres database. This layer is manually managed and never automatically deployed via CI.

We are currently running Postgres 16, which is [supported until Nov 2028](https://www.postgresql.org/support/versioning/). Therefore we should plan to upgrade to the latest major version bar one in early 2028.

## Steps

1. Export the AWS profile credentials for `planx-staging-pulumi` in your active terminal
```
export AWS_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
```
2. Run `pulumi refresh --stack <staging | production>`
The [`refresh` command](https://www.pulumi.com/docs/iac/cli/commands/pulumi_refresh/) compares the state of the AWS stack as Pulumi thinks it should be (that is, the latest state that was successfully applied), against the actual state in AWS. It will highlight any diffs, and consolidate it's own state accordingly.
3. Run `pulumi up --stack <staging | production>`
The [`up` command](https://www.pulumi.com/docs/iac/cli/commands/pulumi_up/) will attempt to apply the state prescribed by `infrastructure/data/index.ts` to the AWS stack. However, it will only display a diff against the state of our Pulumi stack, which may be out of sync with the real state - this is why we should always run `refresh` first.
4. Confirm success/"available" status and new configurations in AWS RDS console

## General prep for major Postgres version upgrades

- Ensure that other parts of our stack are compatible with the Postgres target version (Hasura, ShareDB (SSL configs), Metabase)
- Upgrade Docker images to test on local & pizza environments
- Bump the Pulumi `engineVersion` to a supported upgrade target; test first on staging
    - Hint: run `aws rds describe-db-engine-versions --engine postgres  --engine-version xxx` to see a list of valid upgrade targets for the given version
- Run a few `EXPLAIN ANALYZE` queries before and after to spotcheck performance
- Plan to upgrade any Postgres extensions via a Hasura migration separately upon completion
- Review our database restore process (see below)

** In February 2025 when we upgraded from 12.19 to 16.3 (which we later bumped to 16.7), the upgrade took ~10 minutes total with about ~3 minutes of downtime in the middle where the application was inaccessible. We completed this at a low traffic time and did not turn on Cloudflare "maintenance mode", but this may be worth considering in the future.

## Gotchas and resources

- Despite having a `[planx-staging-pulumi]` profile correctly configured in `~/.aws/credentials`, Pulumi commands incorrectly tried to use the `docker-user` profile. Manually exporting the variables was an easy resolution, but a finicky one to troubleshoot & make sense of!
- AWS automatically applies minor versions inbetween manual data layer deployments for major upgrades. This meant that despite our Pulumi `index.ts` having `engineVersion: 12.17`, our actual RDS instance was on version `12.19` and therefore had different available upgrade targets (16.3 instead of 16.1).
- On one upgrade attempt, we experienced the error `Database instance is in a state that cannot be upgraded: Postgres cluster is in a state where pg_upgrade can not be completed successfully`:
  - The upgrade attempt still completed on its own in the usual time; the Pulumi command did not _fail_, it simply didn't _change_ anything
  - The error was visible in the logs a few minutes in and we did _not_ have to take any extra actions. There was still minimal service downtime in the middle, but other containers in the stack automatically restarted themselves to a healthy state as expected
  - The error was ultimately because we had pending "maintenance tasks"; we adjusted those to apply overnight and our upgrade the next day succeeded as expected. [This article](https://repost.aws/knowledge-center/rds-postgresql-version-upgrade-issues) had a number of helpful pointers for debugging.


# Restoring the database

> Last updated: 2025-02-21

This section is intended as a runbook for responding to a situation where the RDS database on production falls over, and we need to get it back up as quickly as possible.

AWS have both [general docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_RestoreFromSnapshot.html) on restoring a DB instance, and a dedicated [tutorial](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Tutorials.RestoringFromSnapshot.html).

The only '[consideration](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_RestoreFromSnapshot.html#USER_RestoreFromSnapshot.Considerations)' that applies to us from the former document is the point about parameter groups, since we are currently using a [custom parameter group](https://github.com/theopensystemslab/planx-new/blob/main/infrastructure/data/index.ts#L15), which only varies from the default in that is sets `rds.force_ssl = 0`.

## Restoring in the console

...

## Restoring via Pulumi

...
