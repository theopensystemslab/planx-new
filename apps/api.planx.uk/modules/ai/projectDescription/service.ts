import type { ErrorStatus } from "./types.js";

type Success = {
  ok: true;
  value: string;
};

type Failure = {
  ok: false;
  error: ErrorStatus;
};

type Result = Success | Failure;

export const enhanceProjectDescription = async (
  _original: string,
): Promise<Result> => {
  // return { ok: false, error: "INVALID_DESCRIPTION" }
  // return { ok: false, error: "SERVICE_UNAVAILABLE" }
  return { ok: true, value: "Enhanced!" };
};
