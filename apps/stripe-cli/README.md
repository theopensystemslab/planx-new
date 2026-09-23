## Stripe CLI webhook sidecar

**Intro**
 - Forwards Stripe test-mode webhooks to the API (`POST /stripe/webhook`) in environments Stripe can't reach directly - local dev, e2e and Pizzas
 - `docker-compose.yml` runs this service alongside the rest of the stack
 - Staging and production don't use this - each has a webhook endpoint registered in the Stripe dashboard, with its signing secret set as `STRIPE_WEBHOOK_SECRET` via Pulumi

**How it works**

[`stripe listen`](https://docs.stripe.com/cli/listen) opens an _outbound_ connection to Stripe, which pushes events down it for the CLI to forward on to the API. As the connection is outbound, the API never needs a public URL, and there are no dashboard endpoints to register or tear down per environment.

On start, [`entrypoint.sh`](./entrypoint.sh) -
1. Checks `STRIPE_API_KEY` (set from `STRIPE_SECRET_KEY`) is a test-mode key, exiting with an error if it's missing or live-mode
2. Runs `stripe listen --print-secret` and writes the signing secret to `STRIPE_WEBHOOK_SECRET_FILE` on the shared `stripe_cli` volume
3. `exec`s `stripe listen`, forwarding events to the API

The API mounts the same volume and reads the secret via `STRIPE_WEBHOOK_SECRET_FILE` on each request. As a single container both prints the secret and signs events, the two always match - and there's no boot-order dependency between this service and the API, or need to restart the API if the listener restarts.

**Configuration**

| Variable | Description |
| --- | --- |
| `STRIPE_API_KEY` | Test-mode Stripe key, set from `STRIPE_SECRET_KEY` in `.env` |
| `STRIPE_DEVICE_NAME` | Labels this listener in Stripe. Defaults to `planx-local`, Pizzas set `planx-pizza-<PR>` |
| `STRIPE_EVENTS` | Event types to forward - these should match those handled in `api.planx.uk/modules/stripe/webhook/controller.ts` |
| `STRIPE_FORWARD_TO` | The API's webhook URL |
| `STRIPE_WEBHOOK_SECRET_FILE` | Where the signing secret is written - the API reads the same path |

**Shared sandbox**

All non-production environments share a single Stripe sandbox, and every listener receives every event on it. Expect to see events for payments made in other environments (Pizzas, other devs, CI) - the API is responsible for ignoring events for sessions it doesn't recognise. `--events` scoping reduces noise, but doesn't prevent this.

**Helpful resources and troubleshooting**

Trigger test events using the CLI inside the container, which is already authenticated against the sandbox -

```
docker exec stripe-cli stripe trigger payment_intent.succeeded
```

To have the API record the event, attach the metadata of a session in your local database -

```
docker exec stripe-cli stripe trigger payment_intent.created \
  --add "payment_intent:metadata[sessionId]=<session id>" \
  --add "payment_intent:metadata[flowId]=<flow id>" \
  --add "payment_intent:metadata[teamSlug]=<team slug>"
```

Follow delivery with `pnpm logs -- stripe-cli api`. Each event is logged by the sidecar as `-->` when received, and `<--` with the API's response status.

 - **API responds 400** - signature verification failed. Check the API has the `stripe_cli` volume mounted and `STRIPE_WEBHOOK_SECRET_FILE` set
 - **Sidecar keeps restarting** - `STRIPE_SECRET_KEY` is missing or not a test-mode key, check `docker logs stripe-cli`
 - **API responds 500 with "Webhook secret not configured"** - the sidecar hasn't written a secret yet
 - **Sidecar logs `connection refused` / `no route to host`** - the API isn't running or healthy yet
 - **Sidecar exits on a dropped connection** - a [known CLI issue](https://github.com/stripe/stripe-cli/issues/1159), handled by `restart: unless-stopped`
