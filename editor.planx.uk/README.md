# editor.planx.uk

[![Netlify Status](https://api.netlify.com/api/v1/badges/5856b13f-3fad-44ec-ae6c-2c6502df1356/deploy-status)](https://app.netlify.com/sites/planx-new/deploys)

This is a React App for planning officers and other people who need access to PlanX backend to log in and manage flows/services. It is not in the root `docker-compose*.yml` file(s) as it is deployed separately from those services.

## Running locally

This project uses [pnpm](https://github.com/pnpm/pnpm), to install it you can run `npm i -g pnpm`

Then install the project's dependencies

`pnpm install`

and start the development server

`pnpm start`


### Disabling type-checking

If your IDE does type checking for you and you want to save some CPU resources,
you can opt-out of type checking by setting the environment variable
`DISABLE_TYPE_CHECKING=true`.

### Running Storybook

We use [Storybook](https://storybook.js.org/) for our UI component library.

Start the development server

`pnpm start-storybook`
