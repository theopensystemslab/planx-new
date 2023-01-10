# PlanX Client

This package is a declarative boundary between the data access layer (GraphQL/Hasura/Postgres) and the PlanX domain.

Currently, this package is not published but it is linked to project folders (i.e. `pnpm link planx-client`).

Updates for linked project folders (e.g. `e2e`) requires running a build to make changes available: `pnpm build`

## Debugging

Setting the environment variable `DEBUG` to any truthy value turns on the console output for debugging (useful for setup and teardown issues).
