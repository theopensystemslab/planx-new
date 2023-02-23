#!/usr/bin/env bash
set -e
cd $(dirname "$0")

script_dir=$(pwd)
core_dir=${script_dir}/..
root_dir=${core_dir}/..

# exit gracefully on interupt
exitfn () {
  trap SIGINT
  cd ${core_dir}
  [ -e ${pack} ] && rm -f ${pack}
  echo
  exit 1
}

trap "exitfn" INT

if [[ $* != *-y* ]]
then
  # get target from args or use defaults
  target=${@:-api.planx.uk editor.planx.uk}

  echo "You are about to create a new distribution of the core package."
  echo "This will require lockfile changes in these packages: ${target}"
  read -r -p "Are you sure? [y/n] " response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
  then
    echo creating a new distribution of core
  else
    exit 0
  fi
else
  shift
  # get target from args after removing -y flag
  target=${@:-api.planx.uk editor.planx.uk}
fi

# package for distribution and grab the filename
cd ${core_dir}
pack=$(pnpm pack | tail -1)


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
  cd node_modules/core
  pnpm install --frozen-lockfile --ignore-scripts
  pnpm build
  cd ${root_dir}

  echo installed into ${destination}
done

# clean-up
rm -f ${core_dir}/${pack}
