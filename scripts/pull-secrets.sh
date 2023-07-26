#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ -z "${CI}" ]
then
    echo "Fetching secrets for CI"
    aws s3 cp s3://pizza-secrets/root.env ./../.env
    aws s3 cp s3://pizza-secrets/api.env.test ./../api.planx.uk/.env.test
    aws s3 cp s3://pizza-secrets/hasura.env.test ./../hasura.planx.uk/.env.test
else 
    echo "Fetching secrets for developer"
    aws sso login --profile $1
    aws s3 cp s3://pizza-secrets/root.env ./../.env --profile $1
    aws s3 cp s3://pizza-secrets/api.env.test ./../api.planx.uk/.env.test --profile $1
    aws s3 cp s3://pizza-secrets/hasura.env.test ./../hasura.planx.uk/.env.test --profile $1
fi

echo "Complete: Secrets from S3 copied to local machine"
