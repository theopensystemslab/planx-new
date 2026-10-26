# Load testing with Locust

This directory contains Python scripts for load testing using [Locust](https://locust.io/) ([docs](https://docs.locust.io/en/stable/)).

## Setup

We use `uv` to manage dependencies for this project. If you aren't already familiar with this Python project manager, [get set up](https://docs.astral.sh/uv/).

Then:

- run `uv sync` (`pyproject.toml` and `uv.lock` together completely determine the setup)
- run `source .venv/bin/activate` to [activate the virtual environment](https://docs.astral.sh/uv/pip/environments/#using-a-virtual-environment)

## Usage

The `run_locust.sh` script is intended to encode some sensible assumptions and do some of the heavy lifting to make it very easy to run load tests.

Note that it assumes your machine has 8 cores, each of which can handle a workload of ~ 300 users. If you're on Mac/Linux you can check your core count with `lscpu`, and adjust the script accordingly. The latter will vary depending on the workload you're running, so feel free to play around with it (keep an eye on the 'Workers' tab in Locust to track CPU usage).

As an example, the following command will simulate 500 users hitting PlanX staging (`editor.planx.dev`) with a series of requests to Hasura's GraphQL endpoint every 10 seconds (after a period of ramping up):

```sh
./run_locust.sh test_hasura.py 500 staging
```

Then find the Locust GUI at `http://localhost:8089/`.

## Development

The `OpenWorkloadBase` class in `base_workload.py` provides a base class which all the `test_*.py` scripts inherit from. Any new workload should follow the same pattern.

Also note that this project uses [ruff](https://docs.astral.sh/ruff/) for linting and formatting. So before pushing up changes (and with the venv activated), run the following:

```sh
ruff check
ruff format
```

### Auth

Some workloads may require authentication, e.g. `test_api.py`. To get this working, just log in to any environment, grab the JWT and export it in your shell as an `AUTH_TOKEN` environment variable. The same script will only be able to load test staging in a serious fashion if it is also supplied with `SKIP_RATE_LIMIT_SECRET`, which should be in your `.env` file at root of project.

### Samples

The API load testing script requires some files to work with, which are in `/samples`. Care should be taken to make sure anything added there is in the public domain.

For example, I used [Unsplash](https://unsplash.com/s/photos/tree?license=free) to search for an image with a ['free' license](https://unsplash.com/license), and printed a page from the [WikiHouse](https://www.wikihouse.cc/) site as a PDF.

### File scanning

We automatically scan file uploads via [Scanii](https://scanii.com/). In order to ensure we don't use our credits scanning files during load testing, please disable the staging API key via the Scanii web console before commencing any testing.

## Security

Security vulnerabilities are typically flagged by Dependabot in the repository and can be verified locally using `uv`'s built-in audit tool. To scan the lockfile:

```sh
uv audit
```

If vulnerabilities are found, follow these steps to patch them:

1. **Bypass the time-lock (if necessary):** This project uses `uv`'s `exclude-newer` feature to lock dependencies to a rolling timeframe (e.g., 7 days). If a security patch was released very recently, `uv` will ignore it. Allow the patch by adding the package to the `exclude-newer-package` map in `pyproject.toml`.

   ```toml
   [tool.uv]
   exclude-newer-package = { vulnerable_package = false }
   ```

   While you have this file open, please clean up any older package exceptions. Once a patch is older than 7 days, the time-lock no longer restricts it, so old entries can be safely removed to keep the config tidy.

2. **Update the lockfile:** Tell `uv` to explicitly bump the vulnerable package to the latest version in `uv.lock`:

   ```sh
   uv lock --upgrade-package vulnerable_package
   ```

3. **Sync the environment:** Install the newly patched version:

   ```sh
   uv sync
   ```

4. **Verify the fix**: Run the audit tool again to ensure the vulnerabilities have been resolved:
   ```sh
    uv audit
   ```
