#!/usr/bin/env bash
set -o errexit -o pipefail

# run from project root
cd "$(dirname $0)/../.."

echo "root:$SSH_PASSWORD" | chpasswd

# check if swap space is available - see link for more on updating swap:
# https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-22-04
swapon --show

# caddy runs up against kernel buffer limits of host OS, so we increase them
# see https://github.com/quic-go/quic-go/wiki/UDP-Buffer-Sizes
sysctl -w net.core.rmem_max=7500000
sysctl -w net.core.wmem_max=7500000

# set env for this shell
set -o allexport
source .env.pizza
DOCKER_BUILDKIT=1
set +o allexport

# start services
docker compose \
  -f docker-compose.yml \
  -f docker-compose.pizza.yml \
  -f docker-compose.seed.yml \
  up --build  --wait
