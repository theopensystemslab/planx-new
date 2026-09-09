import type { z } from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { OperationResult } from "../../types.js";

export type AnalyzeSessions = ValidatedRequestHandler<
  z.ZodUndefined,
  OperationResult[]
>;
