#!/usr/bin/env bash
set -o errexit -o pipefail

# run from project root
cd "$(dirname $0)/../.."

echo "root:$SSH_PASSWORD" | chpasswd

apt-get update -y

# check if swap space is available - see link for more on updating swap:
# https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-22-04
swapon --show

# install docker
apt-get install apt-transport-https ca-certificates curl gnupg lsb-release -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --batch --yes --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# install hasura cli
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash


# set up core dependency
cd core
pnpm i && pnpm distribute -y api.planx.uk
cd ..

# set env for this shell
set -o allexport
source .env.pizza
DOCKER_BUILDKIT=1
set +o allexport

# start services
docker compose \
  -f docker-compose.yml \
  -f docker-compose.pizza.yml \
  up --build --wait

# insert hasura seeds
cd hasura.planx.uk
hasura seed apply --envfile .env
