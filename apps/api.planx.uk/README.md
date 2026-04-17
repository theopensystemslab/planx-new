# api.planx.uk

Node/Express REST API server, written in TypeScript.

The API handles business logic that can't or shouldn't live in the frontend. This falls into two broad categories:

**Proxying third-party services**

- Payments via [GOV.UK Pay](https://www.payments.service.gov.uk/)
- Emails via [GOV.UK Notify](https://www.notifications.service.gov.uk/)
- Address/map data via [Ordnance Survey](https://developer.ordnancesurvey.co.uk/)
- Geospatial planning data via [Digital Land](https://www.planning.data.gov.uk/)

**Core PlanX business logic**

- Auth (Google/Microsoft OAuth, JWT, roles)
- File uploads to S3
- Publishing and managing flows
- Save & return for applications
- Submitting applications to back-office systems (BOPS, Idox, Uniform, etc.)
- Local planning services (LPS)
- Webhooks, analytics, notifications

## Running locally

Install [pnpm](https://pnpm.io) if you don't already have it `npm install -g pnpm@10.30.2`

Install the project's dependencies `pnpm install`

Start the development server `pnpm dev`

Run tests `pnpm test`

Development notes:

- if you need to test or pull new changes from @opensystemslab/planx-document-templates or @opensystemslab/planx-core, make sure to update the commit hash in package.json first
- you can also use `pnpm link {{local relative path to @opensystemslab/planx-document-templates or @opensystemslab/planx-core}}` to manage local development changes these packages without having to reinstall. If you do this, remember to also run `pnpm unlink` to unlink the local directory and then also update the commit hash to point to the most recent version of the package.
- If you want to test particular files directly, do something like `pnpm vitest server.test.js`.

## Module structure

Modules live under `modules/` and follow the pattern established in [ADR 0007](https://github.com/theopensystemslab/planx-new/blob/main/doc/architecture/decisions/0007-modularise-express-application.md):

```
api.planx.uk/
|-- modules/
|   |-- auth/
|   |   |-- routes.ts
|   |   |-- middleware.ts
|   |   |-- controller.ts
|   |   |-- service.ts
|   |-- ...
|-- app.js
|-- server.js
|-- ...
```

**routes.ts**

- Nice and simple - no business logic, just route definition and documention

**middleware.ts**

- Preprocess incoming requests before reaching route handlers

**controller.ts**

- Orchestrates data processing and interactions with external sources
- Handles request/response logic (res, req, next), validation, error handling

**service.ts**

- Contains the core business logic and operations
- Responsible for communicating with database via GraphQL client
- More easily testable outside the context of the request / response cycle
- Our planx-core library can also be considered, and used as, the service layer

## Docs

API docs are written as `docs.yaml` files per module and served via Swagger UI at `/docs`.

Inline JSDoc `@swagger` annotations are a legacy pattern — do not add new ones, and migrate them to `docs.yaml` if you come across them.

## Hasura clients

When querying Hasura, use the right client for the context. All clients are exported from `client/index.ts`:

| Client        | Role                | When to use                                               |
| ------------- | ------------------- | --------------------------------------------------------- |
| `$api`        | API role (elevated) | Service-to-service requests; side effects like audit logs |
| `$public`     | Public (no auth)    | Unauthenticated requests                                  |
| `$admin`      | Admin secret        | Token verification only                                   |
| `getClient()` | Current user's JWT  | Any operation scoped to the logged-in user's permissions  |

`getClient()` reads the current user's JWT from an [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html) context set up by the auth middleware. It will throw a 500 if called outside of an authenticated request context.

## Request validation

Use the `validate()` middleware (from `shared/middleware/validate.ts`) on any route that takes input. It takes a Zod schema, validates the full request (headers, params, body, query), and stores the typed result in `res.locals.parsedReq`. Use the `ValidatedRequestHandler` type in your controller for typed access.

## Testing

- Unit tests on service-layer logic
- Integration tests using [Supertest](https://github.com/ladjs/supertest) and `graphql-query-mock`
- Aim for 100% coverage on new modules (`pnpm test --coverage`)

## Prior art

https://github.com/theopensystemslab/planx-api
https://github.com/theopensystemslab/planx-local-authority-api
