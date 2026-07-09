#!/bin/bash
set -e

# Fail loudly if any required variable are missing or empty
: "${BUCKET_NAME:?is not set}"
: "${DIST_ID:?is not set}"
: "${SITE_URL:?is not set}"
: "${BUILD_MODE:?is not set}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/../apps/localplanning.services"

BUILD_DIR=dist

echo "Starting Deployment..."
echo "Site: $SITE_URL ($BUILD_MODE)"

echo "Building LPS..."
pnpm build

echo "Syncing Astro assets..."
aws s3 sync $BUILD_DIR/_astro s3://$BUCKET_NAME/_astro \
    --cache-control "max-age=31536000,immutable" \
    --delete

echo "Syncing static files..."
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME \
    --exclude "_astro/*" \
    --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
    --delete

echo "Invalidating CDN..."
aws cloudfront create-invalidation \
    --distribution-id $DIST_ID \
    --paths "/*" > /dev/null

echo "Deployment complete! 🚀"