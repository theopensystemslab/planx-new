#!/usr/bin/env bash
# Usage: check-containers.sh [e2e|dev]
# Exits with an error if the expected Docker Compose project is not running.

ENV=${1:-dev}

if [ "$ENV" = "e2e" ]; then
  PROJECT="planx-e2e"
  FIX_CMD="pnpm tests"
else
  PROJECT="planx-new"
  FIX_CMD="pnpm dev"
fi

RUNNING=$(docker ps --filter "label=com.docker.compose.project=$PROJECT" --filter "status=running" -q)

if [ -z "$RUNNING" ]; then
  echo ""
  echo "Error: $ENV containers are not running (project: $PROJECT)."
  echo "Run '$FIX_CMD' from the project root first."
  echo ""
  exit 1
fi
