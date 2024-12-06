# Performance

## Load testing with Locust

This directory contains Python scripts for load testing using [Locust](https://locust.io/) ([docs](https://docs.locust.io/en/stable/)).

### Setup

We use `uv` to manage dependencies for this project. If you aren't already familiar with this Python project manager, [get set up](https://docs.astral.sh/uv/).

Then just run `uv sync` (`pyproject.toml` and `uv.lock` together completely determine the setup).

### Usage

The `run_locust.sh` script is intended to encode some sensible assumptions and do some of the heavy lifting to make it very easy to run load tests.

Note that it assumes your machine has 8 cores, each of which can handle a workload of 500 users. If on Mac/Linux you can check your core count with `lscpu`, and adjust the script accordingly.

As an example, the following command will simulate 2000 users hitting PlanX staging (`editor.planx.dev`) with a series of requests to Hasura's GraphQL endpoint every 10 seconds (after a period of ramping up):

```sh
./run_locust.sh test_hasura.py 2000 staging
```

Then find the Locust GUI at `http://localhost:8089/`.

Note that the script

### Development

The `OpenWorkloadBase` class in `base_workload.py` provides a base class which all the `test_*.py` scripts inherit from. Any new workload should follow the same pattern.
