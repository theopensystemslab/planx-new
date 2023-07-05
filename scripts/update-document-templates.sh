#!/usr/bin/env bash
set -o errexit -o errtrace

# run from project root
cd $(dirname $0)/..
rootDir=$(pwd)

directories=(api.planx.uk editor.planx.uk)

echo "This command will update planx-core and run \`pnpm install\` in the following directories:"
for dir in ${directories[@]}; do
  echo ${dir}
done
echo

echo -e "Which planx-document-templates commit ref do you want to upgrade to?"
read ref
if [ -z ${ref} ]; then
  echo "no commit ref supplied";
  exit 1
fi
echo

package="github:theopensystemslab\/planx-document-templates\#${ref}\","
expression="s/github:theopensystemslab\/planx-document-templates.\+$/${package}/"

for dir in ${directories[@]}; do
  sed -i ${expression} ${dir}/package.json
  cd ${dir}
  echo installing packages in ${dir}
  pnpm i -s
  cd ${rootDir}
done
