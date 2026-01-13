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

# Create sync.sql file for all our commands which will be executed in a single transaction
touch '/tmp/sync.sql'

tables=(
  # Mandatory tables
  flows 
  users 
  teams 
  team_members 
  team_themes
  team_settings
  templated_flow_edits
  submission_integrations
  flow_integrations
  # Optional tables
  # Please comment in if working on a feature and you require example data locally
  # You will need to manually grant select permissions to the github_actions on production, and update main.sql
  # feedback
  # flow_comments
  # lowcal_sessions
)

# run copy commands on remote db
for table in "${tables[@]}"; do
  target=/tmp/${table}.csv
  read_cmd="\\copy (SELECT * FROM ${table}) TO ${target} WITH (FORMAT csv, DELIMITER ';');"
  psql --quiet ${REMOTE_PG} --command="${read_cmd}"
  echo ${table} downloaded

  if [[ ${RESET} == "reset_all" ]]; then
    reset_cmd="TRUNCATE TABLE ${table} CASCADE;"
    cat $reset_cmd >> '/tmp/sync.sql'
  fi
done

# Copy subset of team_integrations columns
# Do not copy production values
psql --quiet ${REMOTE_PG} --command="\\copy (SELECT id, team_id, staging_bops_submission_url, staging_bops_secret, has_planning_data, staging_govpay_secret, staging_file_api_key, staging_power_automate_api_key FROM team_integrations) TO '/tmp/team_integrations.csv' (FORMAT csv, DELIMITER ';');"
echo team_integrations downloaded

psql --quiet ${REMOTE_PG} --command="\\copy (SELECT DISTINCT ON (flow_id) id, data, flow_id, summary, publisher_id, created_at, has_send_component, has_sections, has_pay_component, service_charge_enabled FROM published_flows ORDER BY flow_id, created_at DESC) TO '/tmp/published_flows.csv' (FORMAT csv, DELIMITER ';');"
echo published_flows downloaded

if [[ ${RESET} == "reset_flows" ]]; then
  cat 'write/truncate_flows.sql' >> '/tmp/sync.sql'
  cat 'write/truncate_team_members.sql' >> '/tmp/sync.sql'
fi

# Add main operations
cat 'write/main.sql' >> '/tmp/sync.sql'

echo "Beginning write transaction..."
psql --quiet ${LOCAL_PG} -f '/tmp/sync.sql' --single-transaction -v ON_ERROR_STOP=on

# clean-up tmp dir
rm -rf /tmp
echo done
