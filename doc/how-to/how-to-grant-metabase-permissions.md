# How to grant Metabase permissions

## What is Metabase?
[Metabase](https://www.metabase.com/) is an open source BI service which we self-host as part of PlanX. It allows teams to view and self-serve analytics dashboards related to their flows, applications, and users.

Metabase is set up and running on both Staging and Production environments, but only the Production instance (with Production data) has dashboards maintained and curated for teams.

## Context
Metabase accesses our staging and production databases through the `metabase_read_only` role which has `SELECT` (read-only) access to a subset of tables and views. This ensures that sensitive user data cannot be inadvertently exposed via Metabase, and any new tables added to the PlanX database have to be explicitly exposed via this role.

The permissions granted for the `metabase_read_only` role are applied via Hasura migrations. This ensures that we have a version-controlled history of this role, and it's access level is documented in code. This is not controlled via Pulumi (IaC) as this is not used for local development or test environments ("Pizzas"), which would necessitate a second method for these environments.

## How is this role used?

### Staging & Production
The `metabase_read_only` role is granted to the `metabase_user` database user, which is manually set up on both staging and production with the following SQL -

```sql
CREATE USER metabase_user WITH PASSWORD `$PASSWORD`;
GRANT metabase_read_only TO metabase_user;
```

The password for Staging and Production databases can be found the OSL 1Password account.

The username and password for Metabase are not controlled via IaC - they are manually entered via the Metabase "Admin" dashboard (`Admin Setting > Databases > "staging" | "production" > Username / Password fields`).

### Locally & Pizzas
If you wish to run Metabase locally using the "analytics" Docker profile (`pnpm analytics` from project root), you will need to manually run the above SQL on your local database with a password of your choice. Alternatively, you can use the root DB username/password.

The Metabase service does not run on Pizzas.

## Metabase permissions
Metabase also operates it's own permissions model, which allows more fine-grained control over tables. This allows "Administrator" users access to all tables granted to the Postgres `metabase_read_only` role, but other users can only access summary views.

## Process
The process for exposing a new table / view to Metabase is as follows - 

### Tables
Generally, we'd favour exposing views of data via Metabase. This means only certain columns can be exposed, and data can be formatted in a more user-friendly manner. 

If you need to expose a new table (e.g. public data) access can be granted via a Hasura migration, e.g. - 

```sql
GRANT SELECT ON public.flows TO metabase_read_only;
```

### Views
When adding a new view, you will need to grant the `metabase_read_only` role `SELECT` access the view. Access should be applied via Hasura migrations, e.g. - 

```sql
GRANT SELECT ON public.YOUR_NEW_VIEW TO metabase_read_only;
```
