# Deploying the data layer

The data layer manages configurations for our AWS RDS Postgres database. This layer is manually managed and never automatically deployed via CI.

We are currently running Postgres 16, which is [supported until Nov 2028](https://www.postgresql.org/support/versioning/). Therefore we should plan to upgrade to the latest major version bar one in early 2028.

## Steps

1. Export the AWS profile credentials for `planx-staging-pulumi` in your active terminal

    ```sh
    export AWS_REGION=eu-west-2
    export AWS_ACCESS_KEY_ID=xxx
    export AWS_SECRET_ACCESS_KEY=xxx
    ```

2. Run `pulumi refresh --stack <staging | production>`

    The [`refresh` command](https://www.pulumi.com/docs/iac/cli/commands/pulumi_refresh/) compares the state of the AWS stack as Pulumi thinks it should be (that is, the latest state that was successfully applied), against the actual state in AWS. It will highlight any diffs, and consolidate it's own state accordingly.

3. Run `pulumi up --stack <staging | production>`.

    The [`up` command](https://www.pulumi.com/docs/iac/cli/commands/pulumi_up/) will attempt to apply the state prescribed by `infrastructure/data/index.ts` to the AWS stack. However, it will only display a diff against the state of our Pulumi stack, which may be out of sync with the real state - this is why we should always run `refresh` first.

4. Confirm success/"available" status and new configurations in AWS RDS console

## General prep for major Postgres version upgrades

- Ensure that other parts of our stack are compatible with the Postgres target version (Hasura, ShareDB (SSL configs), Metabase)

- Upgrade Docker images to test on local & pizza environments

- Bump the Pulumi `engineVersion` to a supported upgrade target; test first on staging. To see a list of valid upgrade targets for the given version, run:

        aws rds describe-db-engine-versions --engine postgres  --engine-version xxx

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


# Runbook: restoring the database from a snapshot

> Last updated on: 2025-03-21

This section is intended as a guide for restoring our RDS managed Postgres database (db) to a former point in time. It is based on rehearsals performed on staging, so YMMV on production. We recommend reading through once before executing any commands!

The most urgent situation we may have to deal with is one in which the production database goes down irreparably, or is deleted, and we need to get a working instance back up as quickly as possible.

For reference, AWS has both [general docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_RestoreFromSnapshot.html) on restoring a db, and a dedicated [tutorial](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Tutorials.RestoringFromSnapshot.html) on restoring from a snapshot in the [AWS console](https://eu-west-2.console.aws.amazon.com/console/home?region=eu-west-2).

The only [consideration](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_RestoreFromSnapshot.html#USER_RestoreFromSnapshot.Considerations) that applies to us from the former document is the point about parameter groups, since we are currently using a [custom parameter group](https://github.com/theopensystemslab/planx-new/blob/main/infrastructure/data/index.ts#L15), which only varies from the `postgres16` default in that it sets `rds.force_ssl = 0`.

Regardless of whether you are going to restore the db via Pulumi or in the AWS console, the first two steps are the same:

- Decide on the [snapshot](https://eu-west-2.console.aws.amazon.com/rds?region=eu-west-2#snapshots-list:) that you will restore the database from - probably the most recent one available for the relevant database.
- _If possible_, take a snapshot of the database that you are intending to replace before proceeding (even if it's in some undesirable state). To do this, go to the relevant [database](https://eu-west-2.console.aws.amazon.com/rds?region=eu-west-2#databases:), navigate to `Maintenance and backups`, scroll down to `Snapshots`, and click the `Take snapshot` button.

## Method

Below, we detail two possible methods for proceeding. In general, we prefer the [Pulumi-managed method](#1-via-pulumi), because it is the more controlled approach, but depending on the situation at hand, it may make more sense to [use the AWS console](#2-via-the-aws-console) directly.

We provide some rules of thumb to help think through this decision:

- If the whole database has been deleted or all data has been lost, then always restore via Pulumi
- If we've suffered partial data loss involving feature-critical tables (e.g. `flows`, `teams`, `users`, `lowcal_sessions`), then restore via Pulumi (and the app should go into maintenance mode)
- If we've suffered partial data loss, but only involving isolated features (e.g. the `feedback` or `analytics` tables) or audit/application logs, we can restore via AWS console to prevent the current database from being deleted, and then repair the current db in-place on a table-by-table basis (and the app does not need to go into maintenance mode)

There may also be a solution to the current issue that do not involving restoring from a snapshot at all. For example, if `teams` was accidently dropped on prod, we could import it directly from staging, since this is one of the tables we sync nightly (especially if the latest snapshot on prod was taken before the sync).

### 1. Via Pulumi

The Pulumi class which controls our RDS db instance(s) is called `aws.rds.Instance` (provisioned [here](https://github.com/theopensystemslab/planx-new/blob/main/infrastructure/data/index.ts#L27), in [`index.ts`](/infrastructure/data/index.ts)).

All we have to do to instruct Pulumi to spin up a new db based on the snapshot of our choice, is add the parameter `snapshotIdentifier` ([docs](https://www.pulumi.com/registry/packages/aws/api-docs/rds/instance/#snapshotidentifier_nodejs)), with the value as the name (not the ARN!) of the snapshot we want to restore from. See an example in [this commit](https://github.com/theopensystemslab/planx-new/pull/4392/commits/6ba7b2c8ff0b982514a787c3462d89655b8c1a10).

Note that when we apply this change, Pulumi will first spin up a new db, with a new auto-generated/random name, and then delete the old one which it was managing. As above, if this is a problem, skip to the AWS method below. Otherwise, continue with the following steps:

1.  Commit the `snapshotIdentifier: "snapshot-name"` line (including `[skip pizza]` in the commit message to minimise CI time), push it up, get the PR approved and merge it in to `main` (this will have to be skipped if you're responding alone, but is good practice).

2.  Then on `main` in your terminal, pull down the changes and `cd` into this directory (from project root, `cd infrastructure/data`).

3. Log into the appropriate environment in the AWS console, so that you can follow stack update progress there.

4. Run through steps 1-3 under [Deploying the data layer](#steps). Before you confirm the `pulumi up` command, first make absolutely sure that you are targeting the correct stack (run `pulumi stack`). Then choose the `details` option, and ensure that the update Pulumi wants to perform looks something like this (if working with staging):

    ```
    pulumi:pulumi:Stack: (same)
      [urn=urn:pulumi:staging::data::pulumi:pulumi:Stack::data-staging]
    ...
    ++aws:rds/instance:Instance: (create-replacement)
    ...
    +-aws:rds/instance:Instance: (replace)
    ...
    --aws:rds/instance:Instance: (delete-replaced)
    ```

5. Once Pulumi is busy applying this change, you can observe in the AWS console. You [should soon see](https://eu-west-2.console.aws.amazon.com/rds?region=eu-west-2#databases:) a new database start to spin up. Record the `DB identifier` (i.e. database name).

6. While we're waiting for that new db to become available (this takes ~7 mins on staging), we can prepare the application layer to point at the new db (in order to keep downtime to a minimum):

    a. In a fresh terminal, `cd` into the application layer (from project root, `cd infrastructure/application`).

    b. Run `pulumi config get db-host` - the value returned should be of the form `instance.xxx.region.rds.amazonaws.com`, where `instance` is the name of the existing db (e.g. something like `app5ec7032`).
  
    c. We are going to replace this value with the URI or 'endpoint' of the new db. This should be as simple as swapping the current `instance` part of the `db-host` string for the new db name (`app...`) which we grabbed in step 5, but it's worth verifying this by clicking through into the new db in the AWS console, and comparing your construction against the `Endpoint` value given there (literally do `Ctrl + F`).

    d. Finally, run `esc env set application/{stack} pulumiConfig.application:db-host [new-endpoint] --secret`, commit the change, push it up, and get the PR approved and ready to merge (but don't merge it yet - we'll do that in step 7). Recall that unlike the data layer, the application layer is deployed automatically via CI/GitHub action ([staging](https://github.com/theopensystemslab/planx-new/actions/workflows/push-main.yml) / [prod](https://github.com/theopensystemslab/planx-new/actions/workflows/push-production.yml)).
    
    **If you're restoring a db on prod**, you'll need to merge this first PR to `main`, then raise a further PR for the `production` branch, and get it approved. Then we are prepared to then run [this workflow](https://github.com/theopensystemslab/planx-new/actions/workflows/cron-deploy-to-production.yml) to apply the changes, which we'll do in step 7.
    
    Note that if you don't have a second dev on hand to approve your PR(s), you'll need to apply the changes to the appropriate stack manually via `pulumi up`.

7. Once the new db is 'Available', hit the button to re-deploy the application layer with the new `db-host` value. Once this completes, everything should be up and running. Go and check! :tada

    NB. `pulumi up` will continue until the old db is deleted (although it should first take a final snapshot, as per [this input](https://github.com/theopensystemslab/planx-new/blob/main/infrastructure/data/index.ts#L43)). The whole process takes less than 20 mins on staging, but may take significantly longer on prod.

### 2. Via the AWS console

Using the AWS console to create a new db from a snapshot can save us from having to redeploy the application layer, because we can manually rename the new db with the name of the original db. However, we do have to take care to configure it correctly, and to then connect the new db to our Pulumi stack.

1. In your terminal, pull down latest changes on `main` and `cd` into this directory (from project root, `cd infrastructure/data`).

2. Start by exporting our existing Pulumi stack. This will provide us with a reference for the exact configuration of our RDS instance, as provisioned in [`index.ts`](/infrastructure/data/index.ts).

        pulumi stack export > stack.json

    We are mostly interested in the entry in the `resources` list with `"type": "aws:rds/instance:Instance"` - specifically the `outputs` section.

    NB. This assumes there has been no stack drift, i.e. that no changes to the RDS setup have been made directly in the AWS console and not reflected in the Pulumi code/state. AWS may also have applied minor version upgrades automatically over time. If the original db still exists, we can additionally consider the `Connectivity & security` and `Configuration` tabs in the AWS console in the hopes of catching any such drift.

3. Now we can go ahead and restore a db from the selected snapshot. Navigate to the snapshot, and select `Actions` > `Restore snapshot`.

    **Do not** assume that all default selections in this form are faithful to the setup of the db from which the snapshot was produced (although some are). For example, at time of writing, our RDS instance is a `Single-AZ` deployment (as reflected in the Pulumi stack export file, and the console), but the `Availability and durability` section defaults to `Multi-AZ`.

    **Do** check the `Additional configuration` section of the form. For example, at time of writing, we are using a custom parameter group, which has to be set here.
    
    Some further notes on this process:

    - If the original db still exists, `DB instance identifier` can be anything (e.g. the snapshot ID), since we will change it later. Otherwise, we can immediately name it after the old db. This should be the `appxxx` value in the stack export (or run `pulumi config get db-host` in `infrastructure/application`).
    - From the Pulumi export, the correct `VPC security group` is not immediately obvious, since it provides an ID rather than the name of the security group, which is how we select it in the form. To find the name of the security group, click on the appropriate ID [here](https://eu-west-2.console.aws.amazon.com/ec2/home?region=eu-west-2#SecurityGroups:) (or reference the db console).

    There are also [AWS docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateDBInstance.Settings.html) on these settings.

4. After you complete the above, the new instance will spin up. On staging, this takes only 4-5 minutes. It should have zero connections because the application layer is not pointed at it (as set by the `db-host` Pulumi config). Therefore, it only remains to set the name of the new/restored db instance to that of the original db instance:

    - If the original db still exists, it will need to be renamed (e.g. `appxxx-original`) - to do this, choose the instance, select `Modify`, change the `DB instance identifier` field as required, hit `Continue`, and then make sure to select `Apply immediately` (rather than in the next maintenance window). The instance will then reboot to apply the change, which may take a few minutes.
    - Once that's taken effect, we can rename the new instance with the original ID by the same process. If at first, AWS refuses the ID, don't panic! Just wait a painstaking few minutes - it just needs time to recognise that the given ID is no longer in use.

Et voilá! Your application layer should now be pointed at a new db instance based on the given snapshot.

If you run `pulumi refresh`, it should report no changes, since the db instance ID has not changed and, assuming we configured the new db correctly, neither has its state. Interestingly, CloudWatch appears to track metrics directly by db ID, so the `Monitoring` tab of the new db (renamed for the old db) will show both the current data for the new instance, as well as historic data for the original instance (with a small gap for the hot swap).

Now go and verify that everything works as expected!
