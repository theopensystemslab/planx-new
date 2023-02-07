#!/usr/bin/env bash
cd $(dirname "$0")

cd ../

project_root=$(pwd)

# get target from arg ($1) or use defaults
target=${1:-../api.planx.uk ../editor.planx.uk}

# ensure build is up-to-date
pnpm build

# package for distribution
pack=$(pnpm pack)

echo
echo distributing ${pack} to ${target}
echo

for destination in ${target}
do
  mkdir -p ${destination}/shared

  # remove any previous version
  rm -rf ${destination}/node_modules/planx-client
  rm -rf ${destination}/shared/planx-client*

  # install a current build
  cp -f ${pack} ${destination}/shared
  cd ${destination}
  pnpm add ./shared/${pack}
  cd ${destination}/node_modules/planx-client
  pnpm install
  pnpm build
  cd ${project_root}

  echo installed into ${destination}
done

# clean-up
rm -f ${pack}
