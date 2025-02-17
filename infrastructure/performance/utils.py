import os
import random
from typing import Any
from urllib.parse import urlparse, unquote


VALID_TARGET_ENVIRONMENTS = ("local", "staging")
MIME_TYPE_BY_FILE_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
}


def get_nested_key(dct: dict[Any, Any], *keys: str) -> Any:
  for key in keys:
    try:
      dct = dct[key]
    except KeyError:
      return None
  return dct


def get_target_host(host_by_env: dict[str, str]) -> str:
  env = os.getenv("TARGET_ENV", "local")
  if env not in VALID_TARGET_ENVIRONMENTS:
    raise ValueError(f"Invalid environment submitted (accepts local/staging): {env}")
  return host_by_env[env]


def get_random_file_from_dir(target_dir: str) -> [str, bytes]:
  files = os.listdir(target_dir)
  random_file = random.choice(files)
  with open(os.path.join(target_dir, random_file), "rb") as f:
    return random_file, f.read()


def get_mime_type_from_filename(filename: str) -> str:
  """
  >>> get_mime_type_from_filename("photo.jpg")
  'image/jpeg'
  >>> get_mime_type_from_filename("document.pdf")
  'application/pdf'
  >>> get_mime_type_from_filename("unknown.svg")
  'application/octet-stream'
  """
  _, file_ext = os.path.splitext(filename)
  return MIME_TYPE_BY_FILE_EXT.get(file_ext, "application/octet-stream")


# based on getS3KeyFromURL from api.planx.uk/modules/file/service/utils.ts
def get_s3_key_from_url(file_url: str) -> str:
  """
  Returns an S3 key in the "fileKey/fileName" format, based on a file's URL.
  >>> get_s3_key_from_url("http://localhost:7002/file/public/cuk684uo/250129-WikiHouse-Manufacturing-Guide.pdf")
  'cuk684uo/250129-WikiHouse-Manufacturing-Guide.pdf'
  >>> get_s3_key_from_url("https://editor.planx.dev/file/public/n4779gp5/OSL.png")
  'n4779gp5/OSL.png'
  """
  parsed_path = urlparse(file_url).path
  file_nanoid, filename = parsed_path.split("/")[-2:]
  # decode any percent-encoded characters
  file_nanoid_decoded = unquote(file_nanoid)
  filename_decoded = unquote(filename)
  return f"{file_nanoid_decoded}/{filename_decoded}"
