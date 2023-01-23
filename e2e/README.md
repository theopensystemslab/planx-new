# End to end tests

More info about e2e tests is available in our [testing approach documentation](https://github.com/theopensystemslab/planx-new/blob/main/doc/architecture/decisions/0003-testing-approach.md).

## Playwight tests

run `pnpm test` to run the Playwright end-to-end suite.

Running tests requires a clean DB which can be set up with `../scripts/start-containers-for-tests.sh`

## Debugging

run `DEBUG=true pnpm test` to run with debug logging (useful for setup and teardown issues)
