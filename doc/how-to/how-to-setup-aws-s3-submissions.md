# How to setup AWS S3 submissions

## Context

When building a submission service, the "Send" component offers an option "Upload to AWS S3" which uploads the application data payload to PlanX's private S3 Bucket - which then in turn allows a council to receive a notification via a Power Automate Webhook and run a script to securely retrieve the application JSON file, download any associated user-uploaded files, generate custom documents, and save the application to their local Microsoft SharePoint environment.

There's full documentation on how this method works in the PlanX Service Specification on Notion here.

Once a council has confirmed they're cleared from their IT dept to use this method (eg allowed to receive external webhook requests) & shared a Power Automate Webhook URL, there's a few steps we need to take:

1. Add the council-provided URL to `team_integrations.power_automate_webhook_url` as plain text via the production Hasura console

1. Create 2x tokens for sending secure requests to the Power Automate webhook and add both encrypted values to:
  - `team_integrations.production_power_automate_api_key` & `team_integrations.staging_power_automate_api_key` via the production Hasura console
  - See `how-to-generate-a-secret` for how to properly generate tokens and encrypt values

1. Create 2x tokens for downloading files from the PlanX S3 Bucket and add values to:
  - Root `.env.example` & `.env`, API's `.env.test` & `.env.test.example` as `FILE_API_KEY_{TEAM_SLUG}`
    - In addition to committing these changes, also manually sync to AWS `pizza-secrets` via `scripts/push-secrets.sh`
  - Root `docker-compose.yml`
  - API's `modules/auth/middleware.ts` function `isAuthenticated`
  - Pulumi's `infrastructure/application/index.ts` list of `apiService` "environment" variables
    - Run `pulumi config set file-api-key-{team_slug} --stack {stack}` 2x for each staging & production stacks
  - Encrypt the values using _our_ encrypt scripts (again see `how-to-generate-a-secret`) and add to `team_integrations.production_file_api_key` & `team_integrations.staging_file_api_key` via the production Hasura console. Please note these values are _not_ currently read, but suitable for a potential future refactor (just a bit tricky because file API keys are issued to a mix of _teams_ and _systems_ (eg BOPS & Idox)).

1. Securely share tokens back to council contact via onetimesecret or similar
