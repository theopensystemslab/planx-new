# api.planx.uk

API is a Node/Express server and REST endpoints. We're in the process of migrating this directory to Typescript.

Our API handles functionality like: 
- Logging into the editor via Google
- Publishing service content
- Uploading files to S3
- Saving and resuming an application
- Querying geospatial data via [Digital Land](https://www.planning.data.gov.uk/)
- Sending emails via [GOV.UK Notify](https://www.notifications.service.gov.uk/)
- Paying via [GOV.UK Pay](https://www.payments.service.gov.uk/)
- Submitting applications to back-office case-management systems

## Running locally

Install [pnpm](https://pnpm.io) if you don't already have it `npm install -g pnpm@7.8.0`

Install the project's dependencies `pnpm install`

Start the development server `pnpm dev`

Run tests `pnpm test`

## Prior art

https://github.com/theopensystemslab/planx-api
https://github.com/theopensystemslab/planx-local-authority-api
