import os
from typing import Any


VALID_TARGET_ENVIRONMENTS = ("local", "staging")


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
