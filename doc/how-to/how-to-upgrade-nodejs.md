# How to upgrade Node.js

This guide walks through the required steps to upgrade Node.js versions across the PlanX repositories.

We should always aim to be on an LTS version (even release numbers). For the full release schedule please see https://nodejs.org/en/about/previous-releases

## planx-new
1. Locally install desired Node.js version  

```shell
nvm install 22.10.0
nvm use 22.10.0
```

2. Update `.nvmrc` file

3. Update Dockerfiles -
  - `api.planx.uk/Dockerfile`
  - `sharedb.planx.uk/Dockerfile`

4. Update `@types/node` package across all projects ([npm](https://www.npmjs.com/package/@types/node)). Note: Only major.minor version need to match e.g. types version 22.10.7893 would be fine for Node 22.10.x ([docs](https://github.com/definitelytyped/definitelytyped#how-do-definitely-typed-package-versions-relate-to-versions-of-the-corresponding-library)).

5. Fix any type issues flagged by the above change

6. Update references to `engines` in API `package.json` file

7. Update `README.md`

8. Rebuild docker containers, test and run locally 

9. Upgrade the `NODE_VERSION` on GitHub (Settings > Secrets and variables > Actions > "Variables" tab > Update `NODE_VERSION` variable). This variable is used across our GitHub actions to define which Node version runs our CI services.

Please note - this update is immediate and will effect other open PRs. It's advisable to hardcode the desired Node version into the GitHub action files initially to test CI and regression tests, before making this change.

## planx-core
Steps 4, 5 & 9 also apply here and should be updated shortly after.