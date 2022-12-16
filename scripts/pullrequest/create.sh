#!/usr/bin/env bash
set -o errexit -o pipefail

echo "root:$SSH_PASSWORD" | chpasswd

apt-get update -y

# check if swap space is available
swapon --show
## create swap
## https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-20-04
#fallocate -l 2G /swapfile
#chmod 600 /swapfile
#mkswap /swapfile
#swapon /swapfile
#echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

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

# start services
docker compose --env-file .env.pizza \
  -f docker-compose.yml -f docker-compose.pizza.yml \
  up --build --wait

# insert hasura seeds
cd hasura.planx.uk
hasura seed apply --envfile ./../.env
