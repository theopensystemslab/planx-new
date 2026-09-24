## Stripe CLI

**Intro**
 - This service forwards Stripe test-mode webhooks to the API (`POST /stripe/webhook`) in environments Stripe can't reach directly - local dev, E2E and Pizzas
 - `docker-compose.yml` runs this service alongside the rest of the stack automatically
 - Staging and production don't use this - each has a webhook endpoint registered in the Stripe dashboard, with its signing secret set as `STRIPE_WEBHOOK_SECRET` via Pulumi

**How it works**

[`stripe listen`](https://docs.stripe.com/cli/listen) opens an outbound connection to Stripe, which pushes events down it for the CLI to forward on to the API.

On start, the [`entrypoint.sh`](./entrypoint.sh) script -
1. Checks `STRIPE_API_KEY` is a test-mode key
2. Runs `stripe listen --print-secret` and writes the signing secret to `STRIPE_WEBHOOK_SECRET_FILE` on the shared `stripe_cli` volume
3. Then runs `stripe listen`, which forwards events to the API

The API reads the secret via `STRIPE_WEBHOOK_SECRET_FILE` on each request. We read this via file (mounted on a shared volume) rather than an `.env` file as this would require re-running docker-compose to pick up.


**Shared sandbox**

All non-production environments share a single Stripe sandbox, and every listener receives every event on it. Expect to see events for payments made in other environments (Pizzas, other devs, CI). Events can be stratified by environment via the `STRIPE_DEVICE_NAME` variable.

The API is responsible for ignoring events for cross-environment sessions it doesn't recognise (TODO!).
