import type { z } from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export interface FailedSubmissionCronResponse {
  message: string;
  cause?: string;
}

export type FailedSubmissionController = ValidatedRequestHandler<
  z.ZodUndefined,
  FailedSubmissionCronResponse
>;
