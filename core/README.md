# PlanX Core

This package is a declarative boundary between the data access layer (GraphQL/Hasura/Postgres) and the PlanX domain.

Currently, this package is not published directly but it is distributed to other packages within this repository.

To Update, run `pnpm distribute` which will build and install a local version of this package into each dependent project.
Optionally, you can distribute (copy files) to a specific location with `pnpm distribute api.planx.uk` (where the last argument is a package relative to the project root).

Running `pnpm distribute` will pack a new version of this package and install it in api.planx.uk/ and editor.planx.uk/ (even if there are no significant changes). If this created an undesirable update to pnpm-lock.yml, each of these projects has a `pnpm reset:core` script which will reset the lock file to the latest checked in version on that branch.

## Debugging

Setting the environment variable `DEBUG` to any truthy value turns on the console output for debugging (useful for setup and teardown issues).
