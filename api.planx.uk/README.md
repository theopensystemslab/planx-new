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

Development notes:

- if you need to test or pull new changes from @opensystemslab/planx-document-templates or @opensystemslab/planx-core, make sure to update the commit hash in package.json first
- you can also use `pnpm link {{local relative path to @opensystemslab/planx-document-templates or @opensystemslab/planx-core}}` to manage local development changes these packages without having to reinstall. If you do this, remember to also run `pnpm unlink` to unlink the local directory and then also update the commit hash to point to the most recent version of the package.

## Prior art

https://github.com/theopensystemslab/planx-api
https://github.com/theopensystemslab/planx-local-authority-api
