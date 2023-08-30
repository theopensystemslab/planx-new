#!/usr/bin/env bash
set -eo pipefail
cd $(dirname ${0})

# db connection strings
LOCAL_PG=${1}
REMOTE_PG=${2}

# RESET set to "reset_flows" will truncate flow data during sync
# RESET set to "reset_all" will truncate all synced tables
RESET=${3}

echo downloading data from production

# set-up tmp dir for remote data
mkdir -p /tmp

# Create sync.sql file for all our comnands which will be executed in a single transaction
touch /tmp/sync.sql

tables=(flows users teams flow_document_templates)

# run copy commands on remote  db
for table in "${tables[@]}"; do
  target=/tmp/${table}.csv
  read_cmd="\\copy (SELECT * FROM ${table}) TO ${target} WITH (FORMAT csv, DELIMITER ';');"
  psql --quiet ${REMOTE_PG} --command="${read_cmd}"
  echo ${table} downloaded

  if [[ ${RESET} == "reset_all" ]]; then
    reset_cmd="TRUNCATE TABLE ${table} CASCADE;"
    cat $reset_cmd > tmp/sync.sql
  fi
done

psql --quiet ${REMOTE_PG} --command="\\copy (SELECT DISTINCT ON (flow_id) id, data, flow_id, summary, publisher_id, created_at FROM published_flows ORDER BY flow_id, created_at DESC) TO '/tmp/published_flows.csv' (FORMAT csv, DELIMITER ';');"
echo published_flows downloaded

if [[ ${RESET} == "reset_flows" ]]; then
  cat write/truncate_flows.sql > tmp/sync.sql
fi

# Add main operations
cat write/main.sql > tmp/sync.sql

echo "Beginning write transaction..."
psql --quiet ${LOCAL_PG} -f tmp/sync.sql --single-transaction -v ON_ERROR_STOP=on

# clean-up tmp dir
rm -rf /tmp
echo done
