# Performance

## Load testing with Locust

This directory contains Python scripts for load testing using [Locust](https://locust.io/) ([docs](https://docs.locust.io/en/stable/)).

### Setup

We use `uv` to manage dependencies for this project. If you aren't already familiar with this Python project manager, [get set up](https://docs.astral.sh/uv/).

Then:
- run `uv sync` (`pyproject.toml` and `uv.lock` together completely determine the setup)
- run `source .venv/bin/activate` to [activate the virtual environment](https://docs.astral.sh/uv/pip/environments/#using-a-virtual-environment)

### Usage

The `run_locust.sh` script is intended to encode some sensible assumptions and do some of the heavy lifting to make it very easy to run load tests.

Note that it assumes your machine has 8 cores, each of which can handle a workload of ~ 300 users. If you're on Mac/Linux you can check your core count with `lscpu`, and adjust the script accordingly. The latter will vary depending on the workload you're running, so feel free to play around with it (keep an eye on the 'Workers' tab in Locust to track CPU usage).

As an example, the following command will simulate 500 users hitting PlanX staging (`editor.planx.dev`) with a series of requests to Hasura's GraphQL endpoint every 10 seconds (after a period of ramping up):

```sh
./run_locust.sh test_hasura.py 500 staging
```

Then find the Locust GUI at `http://localhost:8089/`.

### Development

The `OpenWorkloadBase` class in `base_workload.py` provides a base class which all the `test_*.py` scripts inherit from. Any new workload should follow the same pattern.
