#!/usr/bin/env bash
# this script will purge all _acme-challenge TXT records in Vultr DNS for given pizza
# assumes you have vultr-cli installed and VULTR_API_KEY exported (or a ~/.vultr-cli.yaml config)
set -euo pipefail

PIZZA=$1
DOMAIN="planx.pizza"
TARGET="_acme-challenge.$PIZZA"

# pull records as JSON (using output -o flag), which looks like...
# { "records": [ { id, type, name, data, priority, ttl }, ... ], "meta": {...} }
json=$(vultr-cli dns record list "$DOMAIN" -o json)

# extract record IDs that match our criteria with jq
mapfile -t ids < <(
  echo "$json" | jq -r --arg tgt "$TARGET" '
        .records[]           # unwrap
        | select(.type=="TXT" and .name==$tgt)
        | .id'
)

if [[ ${#ids[@]} -eq 0 ]]; then
  echo "No matching TXT records found - nothing to delete."
  exit 0
fi

# loop through IDs and delete each record
for id in "${ids[@]}"; do
  echo "Deleting record ID $id …"
  vultr-cli dns record delete "$DOMAIN" "$id"
done

echo "Done - removed ${#ids[@]} TXT record(s)."
