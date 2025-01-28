import os

from locust import task

from base_workload import OpenWorkloadBase
from utils import get_target_host


HOST_BY_ENV = {
  "local": os.getenv("EDITOR_URL_EXT", "http://localhost:3000"),
  "staging": "https://editor.planx.dev",
}


class SplashWorkload(OpenWorkloadBase):
  host = get_target_host(HOST_BY_ENV)

  # simple test to simulate users hitting splash page (without auth)
  @task
  def get_splash(self):
    self.client.get("/")
