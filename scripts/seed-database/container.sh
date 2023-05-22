#!/usr/bin/env bash
set -eo pipefail
cd $(dirname ${0})

# set db connection strings
LOCAL_PG=${1}
REMOTE_PG=${2}

echo downloading public data from production

# set-up tmp dir for remote data
mkdir -p /tmp

# run copy commands on remote  db
for read_script in read/*; do
  filename=$(basename ${read_script})
  name=${filename%%.*}
  target=/tmp/${name}.csv

  # [are published flows useful to migrate?]
  if [ ${name} == "published_flows" ]; then
    continue;
  fi

  psql ${REMOTE_PG} -f ${read_script} > ${target}
  echo ${name} downloaded
done

echo beginning write transaction
psql ${LOCAL_PG} -f write.sql --echo-errors

# clean-up tmp dir
rm -rf /tmp
echo done
