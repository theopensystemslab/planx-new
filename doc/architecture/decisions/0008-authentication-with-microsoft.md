# 8. User authentication via Microsoft SSO

Date: 2024-10-31

## Status

Accepted

## Context

Previously, PlanX users could only log in to the editor using Google single sign on (SSO). This was true for OSL devs and end-users alike. Most councils run Microsoft, so we needed to add an additional option to authenticate via Microsoft instead.

## Decisions

We considered replacing the auth business logic wholesale with AWS Cognito, but this seemed like it would be a much more significant overhaul as compared with simply adding a new `passportjs` '[strategy](https://www.passportjs.org/concepts/authentication/strategies/)'.

Since we already had a model strategy for Google, a principle decision which guided this work was to build a strategy for Microsoft which had parity with that existing solution. This also meant leveraging the existing method for a user to identify themselves to the client/editor, which is for the API to return a persistent `jwt` cookie after auth.

### `passportjs`

We considered a few strategies: [`passport-microsoft`](https://www.passportjs.org/packages/passport-microsoft/) didn't pass muster and [`passport-azure-ad`](https://www.passportjs.org/packages/passport-azure-ad/) was [deprecated](https://github.com/AzureAD/microsoft-identity-web/discussions/2405) (without replacement) by Microsoft, so we opted for building a custom solution using [OpenID Connect](https://openid.net/) (aka. OIDC, a layer on top of OAuth2 for which Microsoft has [good documentation](https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc)) with the [certified](https://openid.net/developers/certified-openid-connect-implementations/) [`openid-client`](https://www.passportjs.org/packages/openid-client/) strategy.

### Auth flow

OIDC provides for multiple '[authorisation flows](https://auth0.com/docs/get-started/authentication-and-authorization-flow)'. In our case the frontend, which is a public client, directs users to the API for auth purposes, which can store secrets. This enables us to use Hybrid Flow, rather than the more cumbersome Authorization Code Flow.

### Logging out

We also considered what happens when users who have authenticated via Microsoft SSO log out, either from PlanX, or from their Microsoft account more widely.

In the former case, we simply delete the `jwt` as usual. For the latter case, there was the option of implementing a [front channel logout URL](https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc#what-is-a-front-channel-logout-url). Given the current setup, integrating this feature would have required a significant amount of work, and would also move us beyond parity with the Google solution, so we didn't deem it necessary at this time.

## Consequences

The upshot is that both devs and end-users can log into PlanX with any Microsoft email address (whether personal or belonging to/managed by an organisation).

### ESM adoption

With the implementationd described above, the API server has to fetch the [Microsoft OIDC config](https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration) on boot, which it does asynchronously. Observing this functionality would have required us to either refactor the codebase extensively, or write a [top-level](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await) `await`.

The latter is much simpler and more elegant, but in turn requires that the API codebase is entirely ESM-compliant. This turned out to be a significant spike. Without going into detail, it prompted us to do the following (inter alia):

- replace `ts-node-dev` with `tsx`
- enforce the `verbatimModuleSyntax` [tsconfig option](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax)
- migrate our testing framework from Jest to Vitest
- bump `passportjs` to latest version (a longstanding ticket)

The happy byproduct of all this is a much more modern configuration of the API TypeScript setup, testing suite and dev framework.