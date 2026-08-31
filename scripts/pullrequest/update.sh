#!/usr/bin/env bash
set -o errexit -o pipefail

# Run from project root
cd "$(dirname $0)/../.."

# caddy runs up against kernel buffer limits of host OS, so we increase them
# see https://github.com/quic-go/quic-go/wiki/UDP-Buffer-Sizes
sysctl -w net.core.rmem_max=7500000
sysctl -w net.core.wmem_max=7500000

# ensure docker does not pull caddy image via ipv6 (no subnet configured, it will fail)
sysctl -w net.ipv6.conf.all.disable_ipv6=1
sysctl -w net.ipv6.conf.default.disable_ipv6=1

# set env for this shell
set -o allexport
source .env.pizza
DOCKER_BUILDKIT=1
set +o allexport

# Fallback to building caddy image if pull fails
PIZZA_FAILOVER=""
if docker pull "$VULTR_CR_URN/caddy-vultr:latest"; then
  echo "Caddy image pulled successfully"
else
  echo "Failed to pull caddy image, building from source..."
  PIZZA_FAILOVER="-f docker-compose.pizza.failover.yml"
fi

function compose() {
  docker compose \
    -f docker-compose.yml \
    -f docker-compose.pizza.yml $PIZZA_FAILOVER \
    -f docker-compose.seed.yml \
    "$@"
}

# Build outside the lock. Images don't collide, so this keeps the lock short-lived
compose build

# Use a lock to ensure overlapping runs of this script (pushes to GH in short succession) can't collide
exec 9>/tmp/pizza-deploy.lock
flock 9

# Explicitly drop containers in case provenance of caddy container is changed
compose down --remove-orphans

compose up --no-build --renew-anon-volumes --force-recreate --wait
