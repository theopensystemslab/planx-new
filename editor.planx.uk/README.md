# editor.planx.uk

Editor is our React frontend, which consists of two main environments: an "editor" for service designers and a "preview" for public applicants. Our components are written with Material UI and broadly follow the [GOV.UK design system](https://design-system.service.gov.uk/) patterns. 

## Running locally

Install [pnpm](https://pnpm.io) if you don't already have it `npm install -g pnpm@7.27.0`

Install the project's dependencies `pnpm install`

Start the development server `pnpm start`

Run tests `pnpm test`

### Disabling type-checking

If your IDE does type checking for you and you want to save some CPU resources,
you can opt-out of type checking by setting the environment variable
`DISABLE_TYPE_CHECKING=true`.

### Running Storybook

We use [Storybook](https://storybook.js.org/) for our UI component library.

Start the development server `pnpm start-storybook`
