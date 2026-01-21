#!/usr/bin/env bash
# this script will destroy a 'pizza' instance and associated DNS records on Vultr
# assumes you have vultr-cli installed and VULTR_API_KEY exported (or a ~/.vultr-cli.yaml config)
set -euo pipefail

PIZZA=$1
DOMAIN="planx.pizza"
HOSTNAME="${PIZZA}.${DOMAIN}"

# we expect two DNS A records for each instance (one root, one wildcard)
RECORD1="${PIZZA}"
RECORD2="*.${PIZZA}"

echo "Destroying pizza instance ${PIZZA} and its associated DNS records..."

# get the instance ID by label
echo "Looking up instance ID for pizza ${PIZZA}..."
json=$(vultr-cli instance list -o json)

# extract instance ID that matches our label
instance_id=$(echo "$json" | jq -r --arg label "${HOSTNAME}" '
  .instances[]
  | select(.label==$label)
  | .id' | head -n 1)

if [[ -z "$instance_id" ]]; then
  echo "No instance found with label '${HOSTNAME}' - nothing to delete"
else
  echo "Found instance with ID: $instance_id"
  echo "Deleting instance..."
  vultr-cli instance delete "$instance_id"
fi

# delete the 2 DNS records
echo "Looking up DNS records..."
dns_json=$(vultr-cli dns record list "$DOMAIN" -o json)

# Extract record IDs that match our two record names
mapfile -t record_ids < <(
  echo "$dns_json" | jq -r --arg r1 "$RECORD1" --arg r2 "$RECORD2" '
    .records[]
    | select(.type=="A" and (.name==$r1 or .name==$r2))
    | .id'
)

if [[ ${#record_ids[@]} -eq 0 ]]; then
  echo "No matching DNS A records found - nothing to delete"
else
  echo "Found ${#record_ids[@]} DNS record(s) to delete"
  for id in "${record_ids[@]}"; do
    echo "Deleting DNS record with ID $id..."
    vultr-cli dns record delete "$DOMAIN" "$id"
  done
fi

echo "Done - pizza ${PIZZA} has been destroyed"
