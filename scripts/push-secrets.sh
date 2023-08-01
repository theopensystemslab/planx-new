#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"
profile=${1:-default}

aws sso login --profile profile
aws s3 cp ./../.env s3://pizza-secrets/root.env --profile profile
aws s3 cp ./../api.planx.uk/.env.test s3://pizza-secrets/api.env.test --profile profile
aws s3 cp ./../hasura.planx.uk/.env.test s3://pizza-secrets/hasura.env.test --profile profile
echo "Complete: Secrets from local machine pushed to S3"