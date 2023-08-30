#!/usr/bin/env bash
set -eo pipefail
cd $(dirname ${0})

# db connection strings
LOCAL_PG=${1}
REMOTE_PG=${2}

# RESET set to "reset_flows" will truncate flow data during sync
# RESET set to "reset_all" will truncate all synced tables
RESET=${3}

# INCLUDE_PUBLISHED_FLOWS set to "include_published_flows" will sync published flows
INCLUDE_PUBLISHED_FLOWS=${4}

echo downloading data from production

# set-up tmp dir for remote data
mkdir -p /tmp

tables=(flows users teams flow_document_templates)

# run copy commands on remote  db
for table in "${tables[@]}"; do
  target=/tmp/${table}.csv
  read_cmd="\\copy (SELECT * FROM ${table}) TO ${target} WITH (FORMAT csv, DELIMITER ';');"
  psql --quiet ${REMOTE_PG} --command="${read_cmd}"
  echo ${table} downloaded
  if [[ ${RESET} == "reset_all" ]]; then
    reset_cmd="TRUNCATE TABLE ${table} CASCADE;"
    psql ${LOCAL_PG} --command="${reset_cmd}"
  fi
done

# Start building single sync.sql file which will be executed in a single transaction
if [[ ${RESET} == "reset_flows" ]]; then
  cat write/truncate_flows.sql > sync.sql
fi

# Add main operations
cat write/main.sql > sync.sql

if [[ ${INCLUDE_PUBLISHED_FLOWS} == "include_published_flows" ]]; then
  psql --quiet ${REMOTE_PG} --command="\\copy (SELECT DISTINCT ON (flow_id) id, data, flow_id, summary, publisher_id, created_at FROM published_flows ORDER BY flow_id, created_at DESC) TO '/tmp/published_flows.csv' (FORMAT csv, DELIMITER ';');"
  echo published_flows downloaded

  # Add published flows
  cat write/published_flows.sql > sync.sql
fi

echo "Beginning write transaction..."
psql --quiet ${LOCAL_PG} -f sync.sql --single-transaction -v ON_ERROR_STOP=on

# clean-up tmp dir
rm -rf /tmp
echo done
