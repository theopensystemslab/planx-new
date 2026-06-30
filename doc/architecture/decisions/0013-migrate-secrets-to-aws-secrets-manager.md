# 13. Migrate secrets to AWS Secrets Manager

Date: 2026-04-17

## Status

Proposed

Extends [4. Secret Generation](0004-secret-generation.md)

## Context

PlanX secrets currently live in two places -

**Platform secrets** — API keys, database credentials, and service tokens used by the application itself — are stored in `Pulumi.staging.yaml` and `Pulumi.production.yaml` as Pulumi-encrypted blobs. They are decrypted at deploy time using a passphrase held in a Pulumi personal access token (PAT), and injected into Fargate containers as plaintext environment variables. This means that -

- Every developer with access to the Pulumi PAT can decrypt every production secret.
- Secrets are deployment-sensitive - tightly coupled to the CI/CD pipeline. We need a full production deploy to rotate a secret which can prove challenging.
- There is no auto-rotation support and no audit trail for access.

**Team integration secrets** — per-council API keys for GOV.UK Pay, BOPS, Power Automate, and file upload services — are stored as encrypted values in the `team_integrations` table.

- We are maintaining bespoke encryption logic rather than delegating to a managed service.
- Updating a team secret (e.g. a council rotating their GOV.UK Pay token) requires developer involvement, as there is no possible self-service path.
- Staging and production secrets sit in separate columns of the same table, which creates environmental confusion (see [PR #2499](https://github.com/theopensystemslab/planx-new/pull/2499) for history).

AWS Secrets Manager (SM) is already partially in use - custom domain SSL certificates were recently migrated to AWS SM and are now fetched in `infrastructure/application/index.ts` via `aws.secretsmanager.getSecretVersion`.

## Decision

We will migrate secrets from Pulumi config files to AWS Secrets Manager, in three steps.

### Injecting secrets into Fargate

```typescript
// Before
environment: [
  {
    name: "GOVUK_NOTIFY_API_KEY",
    value: config.requireSecret("govuk-notify-api-key"),
  },
];

// After
const govukNotifySecret = await aws.secretsmanager.getSecret({
  name: "govuk-notify-api-key",
});

secrets: [
  {
    name: "GOVUK_NOTIFY_API_KEY",
    valueFrom: govukNotifySecret.arn,
  },
];
```

### Step 1 - Pilot: GOV.UK Notify API key

We need to rotate this key just now, so it seems like a sensible first step to try out on staging. We can move `govuk-notify-api-key` from `Pulumi.staging.yaml` to AWS SM. Next we would update `infrastructure/application/services/api.ts` to reference it (see above).

Once deployed, we can check it's working and then try out a rotation by updating the SM value and restarting the Fargate task.

If all goes well, we repeat this for `Pulumi.production.yaml`

### Step 2 - Platform secrets

If all goes well, we can then migrate the remaining secrets from `Pulumi.staging.yaml` and `Pulumi.production.yaml` to AWS SM using the same pattern.

After migration, the Pulumi config files will contain only non-sensitive values (CPU allocations, domain names, URLs, scaling parameters) - the `secure:` entries will be gone.

We do not need to complete this as a "big bang", as we rotate secrets we can move them to the new method.

### Step 3 - Team integration secrets

This can happen later, and in-line with https://trello.com/c/A8gB8rSx/3177-configure-council-api-keys-for-file-download-via-teamintegrations-table

We would aim to retire the secrets held in the `team_integrations` table and migrate secrets into AWS SM (using the `teams/{slug}/{key}` naming pattern to group them).

This would open the door to self-service secret management via the PlanX settings pages - a team admin could update their GOV.UK Pay token through the UI, which writes to SM via the API, without developer involvement or a deployment being triggered. This is not currently possible when secrets live in Pulumi config or in `team_integrations`.

Once all team secrets are in SM, the `team_integrations` columns become redundant and can be removed. The `application:encryption-key` Pulumi secret is also retired in step 3, along side the `encrypt` and `decrypt` scripts.

## Developer experience

For local dev and Pizzas, nothing changes - we would still use `.env` files locally, and Pizzas continue to pull from S3 via `pull-secrets.sh`.

For staging and production, we would read and write secrets via the AWS CLI instead of the Pulumi CLI

```sh
# Read a secret (staging)
AWS_PROFILE=planx-staging aws secretsmanager get-secret-value --secret-id govuk-notify-api-key

# Write / rotate a secret (production)
AWS_PROFILE=planx-production aws secretsmanager put-secret-value \
  --secret-id govuk-notify-api-key \
  --secret-string "new-value-here"
```

This isn't as convenient as `pulumi config (set|get) so we could always wrap in a little bash script if we wanted to.

## Consequences

- Rotating a secret is decoupled from a Pulumi deployment
- Auto-rotation would be possible - right now this is done quite ad-hoc (developer offboarding)
- Access to production secrets can be scoped by IAM role rather than being available to anyone holding the Pulumi PAT.
- The `Pulumi.staging.yaml` and `Pulumi.production.yaml` files become safe to read without concern about encrypted blobs leaking sensitive information about the shape of the production config (no risk of forgetting `--secret` and committing something)
- Step 3 removes the requirement to maintain our own encryption logic
- Step 3 is a prerequisite for self-service secret management in the admin platform (if we want this in future)
- AWS SM has a small per-secret cost (~$0.40/secret/month) - not a huge cost for the gains I'd argue?
- The `how-to-add-a-secret.md` docs must will need to be updated after Step 1 to document the new process end-to-end.
