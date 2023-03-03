#!/usr/bin/env bash
# This is the script that runs inside the container
# Usage: container.sh <local_pg_url> <remote_pg_url>

# cd to this script's directory
cd "$(dirname "$0")" || exit

set -ex

LOCAL_PG="$1"
REMOTE_PG="$2"

# fetch users
psql --command="\\COPY (SELECT * FROM users) TO '/tmp/users.csv' (FORMAT CSV, DELIMITER ';')" "${REMOTE_PG}"

# fetch teams
psql --command="\\COPY (SELECT id, name, slug, theme, settings, notify_personalisation, domain FROM teams) TO '/tmp/teams.csv' (FORMAT CSV, DELIMITER ';')" "${REMOTE_PG}"

# fetch flows
psql --command="\\COPY (SELECT * FROM flows) TO '/tmp/flows.csv' (FORMAT CSV, DELIMITER ';')" "${REMOTE_PG}"

# fetch published_flows (the last two)
psql --command="\\COPY (SELECT id, data, flow_id, summary, publisher_id FROM (SELECT id, data, flow_id, summary, publisher_id, ROW_NUMBER() OVER (PARTITION BY flow_id ORDER BY created_at DESC) as row_num FROM published_flows) as subquery WHERE row_num <= 2) TO '/tmp/published_flows.csv' (FORMAT CSV);" "${REMOTE_PG}"

# run container.sql
psql "${LOCAL_PG}" < container.sql
