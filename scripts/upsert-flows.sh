#!/usr/bin/env bash
set -xe

# Setup
pipe=/tmp/osl-partial-dump
rm -f $pipe
trap 'rm -f $pipe' EXIT
mkfifo $pipe

# Download from DigitalOcean
ssh root@docker.planx.uk 'bash -s' <<EOF
source planx-new/.env
psql "\$PG_STRING" <<<"\\copy (SELECT id, team_id, slug, encode(convert_to(data::text, 'utf-8'), 'base64') FROM flows) TO '/root/flows.tsv'"
EOF
scp root@docker.planx.uk:///root/flows.tsv "$pipe" &

# Push to aws/staging
SCRIPT_DIR=$(dirname "$0")
dbUrl="$(cd "$SCRIPT_DIR/../infrastructure/data" && pulumi stack output dbRootUrl --stack staging)"
awk -F $'\t' '{gsub("\\\\n", "", $4); print "INSERT INTO flows (id, team_id, slug, data) VALUES ('\''"$1"'\'', '\''"$2"'\'', '\''"$3"'\'', convert_from(decode('\''"$4"'\'', '\''base64'\''), '\''utf-8'\'') ::json) ON CONFLICT(ID) DO UPDATE SET data = EXCLUDED.data;"}' <"$pipe" | \
  psql "$dbUrl"

# Cleanup
rm -f $pipe
