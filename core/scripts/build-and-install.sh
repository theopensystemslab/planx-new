#!/usr/bin/env bash
set -e
cd $(dirname "$0")

script_dir=$(pwd)
core_dir=${script_dir}/..
root_dir=${core_dir}/..

# exit gracefully on interupt
exitfn () {
  trap SIGINT
  exit 1
}

trap "exitfn" INT

# package for distribution and grab the filename
cd ${core_dir}
pack=$(pnpm pack | tail -1)

# get target from arg ($1) or use defaults
target=${1:-api.planx.uk editor.planx.uk}

echo distributing ${pack} to ${target}
echo

cd ${root_dir}

for destination in ${target}
do
  mkdir -p ${destination}/shared

  # remove any previous version
  [ -e ${destination}/node_modules/core ] && rm -rf ${destination}/node_modules/core
  rm -rf ${destination}/shared/core*

  # install a current build
  cp -f ${core_dir}/${pack} ${destination}/shared
  cd ${destination}
  pnpm add ./shared/${pack}
  cd ${root_dir}

  echo installed into ${destination}
done

# clean-up
rm -f ${core_dir}/${pack}
