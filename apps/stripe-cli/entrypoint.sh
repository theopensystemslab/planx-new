#!/bin/sh

# Forward Stripe test-mode webhooks to the API

set -e

# Check we're in test mode
case "$STRIPE_API_KEY" in
  sk_test_*|rk_test_*) ;;
  *)
    echo "stripe-cli: STRIPE_SECRET_KEY must be a test-mode key" >&2
    exit 1
    ;;
esac

# Remove any previous secret (the healthcheck waits this to exist)
rm -f "$STRIPE_WEBHOOK_SECRET_FILE"

# Print the signing secret and exit, writing it to a temp file for the API to pick up
stripe listen --skip-update --device-name "$STRIPE_DEVICE_NAME" --print-secret > "$STRIPE_WEBHOOK_SECRET_FILE.tmp"
mv "$STRIPE_WEBHOOK_SECRET_FILE.tmp" "$STRIPE_WEBHOOK_SECRET_FILE"

# Start the listener
exec stripe listen --skip-update \
  --device-name "$STRIPE_DEVICE_NAME" \
  --events "$STRIPE_EVENTS" \
  --forward-to "$STRIPE_FORWARD_TO"
