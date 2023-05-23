#!/usr/bin/env bash
set -eo pipefail
cd $(dirname ${0})

# db connection strings
LOCAL_PG=${1}
REMOTE_PG=${2}

# RESET flag set to "reset_flows" will truncate flow data during sync
# RESET flag set to "reset_all" will truncate all synced tables
RESET=${3}

echo downloading public data from production

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

if [[ ${RESET} == "reset_flows" ]]; then
  psql ${LOCAL_PG} --command="TRUNCATE TABLE flows CASCADE;"
fi

echo beginning write transaction
psql --quiet ${LOCAL_PG} -f write.sql

# clean-up tmp dir
rm -rf /tmp
echo done
