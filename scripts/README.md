# `/scripts`
## `upsert-production-flows`

This script is used to pull production data onto the local development environment.
This is useful to debug scenarios where bugs depend on content (i.e. on flow data).
It upserts teams and flows if the flows table is empty.
Beware that all teams will be deleted and replaced by the teams on production.

To run it, either run `pnpm upsert-flows` or `docker compose up` from the root folder.

## `pull-secrets`
This script is used to pull secrets required for local development of PlanX to a local machine.
It uses the AWS CLI to copy files from S3. In order to use this you will require - 
 - The AWS CLI installed locally
 - AWS credentials stored in the `~/.aws` directory of you machine. These should be generated and shared as part of developer onboarding.

You will need to run this script if a new secret has been added to the application, or as part of initial setup of the repository.

## `push-secrets`
This script is used to push local secrets to S3 for other developers or CI environments to access.

It uses the AWS CLI to copy files to S3. In order to use this you will require - 
 - The AWS CLI installed locally
 - AWS credentials stored in the `~/.aws` directory of you machine. These should be generated and shared as part of developer onboarding.

You will need to run this script if you have added a new secret, or rotated API keys for local or Pizza environments.
