#!/usr/bin/env sh
if [ $# -lt 2 ]
then
  echo ""
  echo "Import the full OrdnanceSurvey Address Base dataset into Postgres:"
  echo ""
  echo "  $ ./import-address-base <postgres-connection-string> <path-to-csv>"
  echo ""
  exit 1
fi

psql -c "\copy address_base FROM '$2' WITH CSV HEADER;" "$1"
