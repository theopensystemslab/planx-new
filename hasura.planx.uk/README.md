# hasura.planx.uk

This is the configuration directory for [Hasura](https://hasura.io), our GraphQL API layer that securely exposes data in our postgres database.

### Running locally

- `pnpm i` installs dependencies
- `pnpm start` opens Hasura's web console (requires planx-new/.env, see main README for how to setup secrets)

### Tests

Hasura tests assume Docker is already up and running from the project root (`docker compose up --build`)

```sh
cd tests
pnpm install
pnpm run test
```
