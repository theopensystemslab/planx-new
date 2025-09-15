# seed-database

This script uses a read-only database user (`github_actions`) to selectively sync data from a production database to a local development database. See `PRODUCTION_PG_URL_FOR_USER_GITHUB_ACTIONS`. 

When adding a new table to the sync script, you may need to first grant permissions like `GRANT SELECT ON "public"."your_table_name" TO github_actions;`.

This is useful for having production-grade data both locally and on ephemeral pizza links (i.e. vultr servers that are spun up for each Pull Request).
