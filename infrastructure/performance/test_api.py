import logging
import os

from locust import (
  constant_pacing,
  events,
  task,
)

from base_workload import OpenWorkloadBase
from utils import (
  get_mime_type_from_filename,
  get_random_file_from_dir,
  get_s3_key_from_url,
  get_target_host,
)


TASK_INVOCATION_RATE_SECONDS = 10
HOST_BY_ENV = {
  "local": os.getenv("API_URL_EXT", "http://localhost:7002"),
  "staging": "https://api.editor.planx.dev",
}
SAMPLE_FILE_DIRECTORY = "samples"
MIME_TYPE_BY_FILE_EXT = {
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "png": "image/png",
  "pdf": "application/pdf",
}
AUTH_TOKEN = os.getenv("AUTH_TOKEN")
SKIP_RATE_LIMIT_SECRET = os.getenv("SKIP_RATE_LIMIT_SECRET")


logger = logging.getLogger(__name__)


# Locust also provides hooks for test-level setup/teardown
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
  # need a valid JWT in the environment in order to upload anything, so don't continue without
  if not AUTH_TOKEN:
    logger.error("Export a valid AUTH_TOKEN (i.e. JWT) to run this workload")
    environment.runner.quit()
  if not SKIP_RATE_LIMIT_SECRET:
    logger.warning(
      "Export SKIP_RATE_LIMIT_SECRET in order to circumvent API rate limiting"
    )


class APIWorkload(OpenWorkloadBase):
  wait_time = constant_pacing(TASK_INVOCATION_RATE_SECONDS)
  host = get_target_host(HOST_BY_ENV)

  # Please ensure that the Scannii API key for this environment is disabled prior to running this task
  @task
  def upload_public_file(self) -> None:
    # it is essentially free to upload files to S3, and also free to delete them
    # however it costs more to keep it there and to pull it down, so we don't load test that aspect
    # we want to test a range of file types and sizes (although none should be larger than 30MB)
    filename, file_bin = get_random_file_from_dir(SAMPLE_FILE_DIRECTORY)
    file_url = None
    with self.rest(
      "POST",
      "/file/public/upload",
      name="/file/public/upload",
      headers={
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "X-Skip-Rate-Limit-Secret": SKIP_RATE_LIMIT_SECRET,
      },
      data={"filename": filename},
      files={"file": (filename, file_bin, get_mime_type_from_filename(filename))},
    ) as resp:
      body = resp.js
      if body is None:
        return resp.failure("No body in response from server")
      file_url = body.get("fileUrl")
      if file_url is None:
        return resp.failure("Body did not contain expected URL for uploaded file")
      resp.success()

    # if successful, then we delete the file so as not to clutter the bucket
    if file_url:
      key = get_s3_key_from_url(file_url)
      with self.rest(
        "DELETE",
        f"/file/public/{key}",
        name="/file/public/{key}",
        headers={
          "Authorization": f"Bearer {AUTH_TOKEN}",
          "X-Skip-Rate-Limit-Secret": SKIP_RATE_LIMIT_SECRET,
        },
      ) as resp:
        if resp.status_code != 204:
          return resp.failure("Failed to delete file")
        resp.success()

  # TODO: add another task which hits the /upload-submission endpoint
  # @task
  # def upload_submission(self) -> None:
  #   pass
