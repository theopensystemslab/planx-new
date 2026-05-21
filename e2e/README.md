# End to end tests

The purpose of the end-to-end test suites are to provide confidence in the correctness of the implemented features and functionality of PlanX services as they change and evolve.

More info about e2e tests is available in our [testing approach documentation](https://github.com/theopensystemslab/planx-new/blob/main/doc/architecture/decisions/0003-testing-approach.md).

## UI driven tests

We use [Playwright](https://playwright.dev/docs/api/class-test) to run UI driven tests where user interactions are simulated via a web browser.

### Running UI-driven tests

1. Navigate to `/tests/ui-driven`
2. Run `pnpm install` to install the Playwright package.
3. Run `pnpm exec playwright install` to install the Playwright test browsers.
4. Run the tests with `pnpm test`

## API driven tests

We use [Gherkin](https://cucumber.io/docs/gherkin/reference) to run API tests where interactions are simulated via automated network requests. For more details please see [our README here](https://github.com/theopensystemslab/planx-new/blob/main/e2e/tests/api-driven/README.md)).

# Running Tests

Run `pnpm test` to run the full end-to-end suite.

Running tests requires a clean DB which can be set up with `../scripts/start-containers-for-tests.sh`

This script also builds the editor automatically (skipping the build if nothing has changed). If you make changes to `apps/editor.planx.uk` after the containers are already running, you must re-build the editor, with one of:
- `cd apps/editor.planx.uk && pnpm build` - if just the editor code has changed
- `e2e/tests/ui-driven/build-editor.sh` - if the editor code and dependencies have changed
- `pnpm tests` (from root) - if other containers also need to be restarted

## Debugging

run `DEBUG_LOG=true pnpm test` to run with debug logging (useful for setup and teardown issues)
