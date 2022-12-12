#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

aws s3 cp s3://pizza-secrets/root.env ./../.env
aws s3 cp s3://pizza-secrets/api.env.test ./../api.planx.uk/.env
aws s3 cp s3://pizza-secrets/editor.env ./../editor.planx.uk/.env
aws s3 cp s3://pizza-secrets/hasura.env.test ./../hasura.planx.uk/.env.test
echo "Complete: Secrets from S3 copied to local machine"