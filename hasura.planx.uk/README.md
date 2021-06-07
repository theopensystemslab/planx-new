# hasura.planx.uk

This the configuration directory for [Hasura](https://hasura.io), which is our GraphQL API layer that securely exposes data in our postgres database.

### Tests

Hasura tests assume Docker is already up and running from the project root (`docker compose up --build`)

```sh
cd tests
pnpm install
pnpm run test
```
