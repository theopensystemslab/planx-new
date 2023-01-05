#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

aws s3 cp ./../.env s3://pizza-secrets/root.env
aws s3 cp ./../api.planx.uk/.env.test s3://pizza-secrets/api.env.test
aws s3 cp ./../hasura.planx.uk/.env.test s3://pizza-secrets/hasura.env.test
echo "Complete: Secrets from local machine pushed to S3"