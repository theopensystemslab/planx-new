# How to upgrade Node.js

This guide walks through the required steps to upgrade Node.js versions across the PlanX repositories.

We should always aim to be on an LTS version (even release numbers). For the full release schedule please see https://nodejs.org/en/about/previous-releases

## planx-new

1. Locally install desired Node.js version

```shell
nvm install 24.14.0
nvm use 24.14.0
```

2. Update `.nvmrc` file

3. Update Dockerfiles -

- `apps/api.planx.uk/Dockerfile`
- `apps/sharedb.planx.uk/Dockerfile`

4. Update `@types/node` package across all projects ([npm](https://www.npmjs.com/package/@types/node)). Note: Only major.minor version need to match e.g. types version 22.10.7893 would be fine for Node 22.10.x ([docs](https://github.com/definitelytyped/definitelytyped#how-do-definitely-typed-package-versions-relate-to-versions-of-the-corresponding-library)).

5. Fix any type issues flagged by the above change

6. Update references to `engines` in API `package.json` file

7. Update `README.md`

8. Rebuild docker containers, test and run locally

9. Upgrade the Node version used for GitHub Actions by updating our "Setup Node and pnpm" action (/.github/actions/setup-node-pnpm/action.yml). This shared action is used across our GHA jobs to define which Node version runs our CI services.

Please note - this update is immediate and will effect other open PRs. It's advisable to hardcode the desired Node version into the GitHub action files initially to test CI and regression tests, before making this change.

## planx-core

Steps 1, 2, 4, 5 & 9 also apply here and should be updated shortly after.

## AWS Lambda

### Scanii

We maintain three serverless applications across our two AWS accounts — one per `user-data` bucket (staging, production), and the `pizza-user-uploads` bucket that pizzas write to. These send all uploaded files to the Scanii API to check for malicious content, then delete or tag the files as appropriate. They are installed manually rather than managed via IaC/Pulumi, as per [this section in the data layer README](../../infrastructure/data/README.md#Scanii).

These include lambdas which run on Node, but these are not tied to the Node version used by PlanX. Nevertheless, this is a good opportunity to upgrade!

**Do not edit the runtime on the Scanii functions directly.** It is tempting to bump `Runtime settings` directly in the Lambda console, but we did not author these functions and have no guarantees that expected behaviour will be maintained.

Instead, deploy the latest version of the serverless application by following [this section in the data layer README](../../infrastructure/data/README.md#upgrading-to-a-new-version), which will come packaged with an appropriate runtime. Note in particular that the trigger migration needs uploads blocked for its duration, so this is not a change to make casually — and that it has to be repeated for all three stacks.

### Lambda@Edge function runtime

The `flow_link_preview.js` Lambda@Edge function is managed via Pulumi. Its Node.js runtime is configured via the `lambda-nodejs-runtime` Pulumi config value.

To upgrade, update the value in each stack:

```shell
pulumi config set lambda-nodejs-runtime nodejs24.x --stack <stack>
```

## Netlify

[Netlify](https://www.netlify.com/) is used to deploy [storybook.planx.dev](https://storybook.planx.dev/) and [storybook.planx.uk](https://storybook.planx.uk/) on merge to `main` and `production` respectively.

The Node (and pnpm) version used for the runners responsible for the build and deploy need to be kept up to date.

This needs to be configured in the two following locations -

1. Environmental variables
   https://app.netlify.com/projects/planx-storybook/configuration/env#environment-variables

2. Dependency management
   https://app.netlify.com/projects/planx-storybook/configuration/deploys#dependency-management

## `vultr-action` GitHub action

[`vultr-action`](https://github.com/theopensystemslab/vultr-action) is a GitHub action used to create instances and DNS records on the Vultr cloud service. PlanX CI/CD runs this each time a PR is opened or updated.

Unlike our other repos, this action runs a pre-bundled file (`dist/index.js`), and is consumed by git tag rather than published to npm. Upgrading Node here means rebuilding the bundle and making a new release.

1. Update the Node runtime and `engines`:

   ```yaml
   # action.yml
   runs:
     using: "node24"
     main: "dist/index.js"
   ```

   ```jsonc
   // package.json
   "engines": {
     "pnpm": ">=10.0.0 <11.0.0",
     "node": ">=24.0.0 <25.0.0"
   },
   ```

2. Update the TypeScript config to match. Swap the base config dependency and `@types/node`:

   ```shell
   pnpm remove @tsconfig/node20 @types/node
   pnpm add -D @tsconfig/node24 @types/node@^24
   ```

   Then point `tsconfig.json` at the new base config:

   ```jsonc
   // tsconfig.json
   "extends": "@tsconfig/node24/tsconfig.json",
   ```

3. Fix any type issues flagged by the above change

4. Publish `vultr-action`, as per the [README.md](https://github.com/theopensystemslab/vultr-action/blob/main/README.md)

5. Upgrade to the new version in `planx-new`
