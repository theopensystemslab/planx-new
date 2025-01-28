from locust import (
  constant_pacing,
  FastHttpUser,
  stats,
)


# we want the double & triple nine percentiles to be reported in the chart and statistics (already in csv)
stats.PERCENTILES_TO_CHART = (0.5, 0.95, 0.99, 0.999)
stats.PERCENTILES_TO_STATISTICS = (0.95, 0.99, 0.999)

# by default, we attempt to have each user run a task every second (or as fast as possible if latency is greater)
# this means that user count will correspond roughly to request rate (assuming most tasks emit 1 request)
TASK_INVOCATION_RATE_SECONDS = 1


class OpenWorkloadBase(FastHttpUser):
  # this is a base class, intended to be subclassed for each test workload
  abstract = True
  wait_time = constant_pacing(TASK_INVOCATION_RATE_SECONDS)
  default_headers = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-GB,en;q=0.9",
    "cache-control": "no-cache",  # locust has no cache
    "pragma": "no-cache",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  }

  def on_start(self):
    pass

  def on_stop(self):
    pass
