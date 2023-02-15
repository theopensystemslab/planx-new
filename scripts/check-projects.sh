#!/bin/bash
set -eo pipefail
cd $(dirname "$0")

ROOT_DIR=..

for project in api.planx.uk editor.planx.uk planx-client
do
  cd ${ROOT_DIR}/${project}
  pnpm check || pnpm lint
done
