#!/bin/bash
set -euo pipefail 

# Check if team name was provided
if [ -z "${1:-}" ]; then
  echo "Error: Team name is required" >&2
  echo "Usage: $0 <team-name>" >&2
  exit 1
fi

TEAM_NAME=$1

# Check if required files exist
for file in council.cert council.key; do
  if [ ! -f "$file" ]; then
    echo "Error: $file not found" >&2
    exit 1
  fi
done

# Build JSON payload for AWS Secrets Manager
if [ -f chain.cert ]; then
  echo "Updating secret ssl/${TEAM_NAME} with cert, chain, and key..."
  SECRET_STRING=$(jq -n \
    --rawfile cert council.cert \
    --rawfile chain chain.cert \
    --rawfile key council.key \
    '{cert: $cert, chain: $chain, key: $key}')
else
  echo "Updating secret ssl/${TEAM_NAME} with cert and key (no chain)..."
  SECRET_STRING=$(jq -n \
    --rawfile cert council.cert \
    --rawfile key council.key \
    '{cert: $cert, key: $key}')
fi

# Try to update existing secret (e.g. renewals)
if aws secretsmanager put-secret-value \
  --secret-id "ssl/${TEAM_NAME}" \
  --secret-string "$SECRET_STRING" \
  --no-cli-pager > /dev/null; then
  echo "Secret ssl/${TEAM_NAME} updated successfully!"

# Otherwise create the secret (e.g. setting up subdomains for the first time)
else
  echo "Secret not found, creating it..."
  aws secretsmanager create-secret \
    --name "ssl/${TEAM_NAME}" \
    --secret-string "$SECRET_STRING" \
    --no-cli-pager > /dev/null
  
  echo "Secret ssl/${TEAM_NAME} created successfully!"
fi