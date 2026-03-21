# Flow Link Preview

A [Lambda@Edge](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html) function that provides rich link previews (OG meta tags) for PlanX flow URLs shared on Slack, Teams, Discord, iMessage, Twitter, etc.

## Overview

This Lambda@Edge function intercepts crawler requests and returns minimal HTML with OG meta tags.

For non-crawler requests, the function passes the original request through without alteration.

### Crawler request
```mermaid
sequenceDiagram
    participant Crawler as Link Preview Crawler
    participant CF as CloudFront
    participant Lambda as Lambda@Edge
    participant Hasura

    Crawler->>CF: GET /:team/:flow/published
    CF->>Lambda: Viewer request trigger
    Note over Lambda: Detect crawler User-Agent

    Lambda->>Hasura: Fetch flow metadata (name, summary, team)
    Hasura->>Lambda: Flow metadata

    Lambda->>CF: Return HTML with OG tags
    CF->>Crawler: 200 OK (HTML with meta tags)
```

### Normal browser request
```mermaid
sequenceDiagram
    participant Browser
    participant CF as CloudFront
    participant Lambda as Lambda@Edge
    participant S3

    Browser->>CF: GET /:team/:flow/published
    CF->>Lambda: Viewer request trigger
    Note over Lambda: Non-crawler UA. Pass thru

    Lambda->>CF: Forward to origin
    CF->>S3: Fetch SPA
    S3->>CF: SPA
    CF->>Browser: SPA loads normally
```

## Local testing

Run the test script against a live Hasura instance:

```sh
# Production
HASURA_URL=https://hasura.editor.planx.uk/v1/graphql node test_flow_link_preview.js southwark apply-for-a-lawful-development-certificate

# Staging
HASURA_URL=https://hasura.editor.planx.dev/v1/graphql node test_flow_link_preview.js
```

## Deployment

Deployed via Pulumi as a Lambda@Edge function attached to all CloudFront distributions — custom council domains (`planningservices.{council}.gov.uk`) and the main `editor.planx.uk` frontend.

Key constraints:
- Lambda@Edge functions must be created in `us-east-1`
- Viewer-request triggers don't support environment variables — the Hasura URL is inlined by Pulumi at deploy time
- The `__HASURA_URL__` placeholder in `flow_link_preview.js` is replaced per environment
