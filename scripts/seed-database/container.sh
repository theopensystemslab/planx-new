#!/usr/bin/env bash
set -eo pipefail
cd $(dirname ${0})

# set db connection strings
LOCAL_PG=${1}
REMOTE_PG=${2}

echo downloading public data from production

# set-up tmp dir for remote data
mkdir -p /tmp

tables=(flows users teams flow_document_templates)

# run copy commands on remote  db
for table in "${tables[@]}"; do
  target=/tmp/${table}.csv
  cmd="\\copy (SELECT * FROM ${table}) TO ${target} WITH (FORMAT csv, DELIMITER ';');"
  psql --quiet ${REMOTE_PG} --command="${cmd}"
  echo ${table} downloaded
done

echo beginning write transaction
psql --quiet ${LOCAL_PG} -f write.sql

# clean-up tmp dir
rm -rf /tmp
echo done
