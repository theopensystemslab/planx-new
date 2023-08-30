# editor.planx.uk

Editor is our React frontend, which consists of two main environments: an "editor" for service designers and a "preview" for public applicants. Our components are written with Material UI and broadly follow the [GOV.UK design system](https://design-system.service.gov.uk/) patterns. 

## Running locally

Install [pnpm](https://pnpm.io) if you don't already have it `npm install -g pnpm@8.6.6`

Install the project's dependencies `pnpm install`

Start the development server `pnpm start`

Run tests `pnpm test`

Development notes:

 - if you need to test or pull new changes from @opensystemslab/planx-document-templates or @opensystemslab/planx-core, make sure to update the commit hash in package.json first
 - you can also use `pnpm link {{local relative path to @opensystemslab/planx-document-templates or @opensystemslab/planx-core}}` to manage local development changes these packages without having to reinstall. If you do this, remember to also run `pnpm unlink` to unlink the local directory and then also update the commit hash to point to the most recent version of the package.

### Disabling type-checking

If your IDE does type checking for you and you want to save some CPU resources,
you can opt-out of type checking by setting the environment variable
`DISABLE_TYPE_CHECKING=true`.

### Running Storybook

We use [Storybook](https://storybook.js.org/) for our UI component library.

Start the development server by running `pnpm storybook`

Deployment notes:

 - Each open pull request will have its own Storybook available at `storybook.{PR#}.planx.pizza`
 - Netlify handles production Storybook deploys on every commit to `#main` and updates link https://storybook.planx.uk/ 
  - Notifications for failed Netlify deploys are posted in #planx-notifications-internal on Slack
