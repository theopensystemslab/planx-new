# `/scripts`

## `import-address-base.sh`

Use this script to import the full OrdnanceSurvey AddressBase dataset into postgres.
Use this script to seed the production environment.

```sh
$ ./import-address-base <postgres-connection-string> <path-to-csv>
```

You can download the full dataset at [orders.ordnancesurvey.co.uk]().

## `upsert-production-flows`

This script is used to pull production data onto the local development environment.
This is useful to debug scenarios where bugs depend on content (i.e. on flow data).
It upserts teams and flows if the flows table is empty.
Beware that all teams will be deleted and replaced by the teams on production.

To run it, either run `pnpm upsert-flows` or `docker-compose up` from the root folder.
