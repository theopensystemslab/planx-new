#!/bin/bash
set -e

REQUIRED_VARS=("BUCKET_NAME" "DIST_ID" "SITE_URL" "BUILD_MODE")

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Environment variable '$var' is not set."
  fi
done

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/../apps/localplanning.services"

BUILD_DIR=dist

echo "Starting Deployment..."
echo "Site: $SITE_URL ($BUILD_MODE)"

echo "Building LPS..."
pnpm build --site "$SITE_URL" --mode "$BUILD_MODE"

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