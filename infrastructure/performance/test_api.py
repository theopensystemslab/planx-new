from locust import (
  constant_pacing,
  task,
)

from base_workload import OpenWorkloadBase
from utils import (
  get_mime_type_from_filename,
  get_random_file_from_dir,
  get_target_host,
)


TASK_INVOCATION_RATE_SECONDS = 10
HOST_BY_ENV = {
  # "local": os.getenv("API_URL_EXT", "http://localhost:7002"),
  "local": "http://localhost:8001",
  "staging": "https://api.editor.planx.dev",
}
SAMPLE_FILE_DIRECTORY = "samples"
MIME_TYPE_BY_FILE_EXT = {
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "png": "image/png",
  "pdf": "application/pdf",
}
AUTH_JWT = "your-jwt-here"


class APIWorkload(OpenWorkloadBase):
  wait_time = constant_pacing(TASK_INVOCATION_RATE_SECONDS)
  host = get_target_host(HOST_BY_ENV)

  def on_start(self):
    # need to auth in order to upload anything
    pass

  @task
  def upload_public_file(self) -> None:
    # it is essentially free to upload files to S3, and also free to delete them
    # however it costs more to keep it there and to pull it down, so we don't load test that aspect
    # we want to test a range of file types and sizes (although none should be larger than 30MB)
    filename, file_bin = get_random_file_from_dir(SAMPLE_FILE_DIRECTORY)
    with self.rest(
      "POST",
      "/file/public/upload",
      cookies={"jwt": AUTH_JWT},
      files={"file": (filename, file_bin, get_mime_type_from_filename(filename))},
    ) as resp:
      print(resp)

  # @task
  # def handle_submission(self) -> None:
  #   pass