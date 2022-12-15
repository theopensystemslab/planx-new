#!/bin/bash

echo "root:$SSH_PASSWORD" | chpasswd

apt-get update -y

# create swap
# https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-20-04
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# install docker
apt-get install apt-transport-https ca-certificates curl gnupg lsb-release -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --batch --yes --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install docker-ce docker-ce-cli containerd.io -y

# install docker-compose
curl -L "https://github.com/docker/compose/releases/download/v2.14.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

docker compose --env-file .env.pizza -f docker-compose.yml -f docker-compose.pizza.yml up --build -d

# install hasura cli
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
cd hasura.planx.uk || exit 1
hasura seed apply --envfile ./../.env
