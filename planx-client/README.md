# PlanX Client

This package is a declarative boundary between the data access layer (GraphQL/Hasura/Postgres) and the PlanX domain.

Currently, this package is not published but it is copied and linked to project folders (i.e. `pnpm link planx-client`).

To Update, run `pnpm distribute` which will build and install a local version of this package into each dependent project.
Optionally, you can distribute (copy files) to a specific location with `pnpm distribute ../api.planx.uk` (where the last argument is a relative path to a directory from the project root).

## Debugging

Setting the environment variable `DEBUG` to any truthy value turns on the console output for debugging (useful for setup and teardown issues).
