import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import type { ApiErrorStatus, GatewayFailureStatus } from "../types.js";

export const projectDescriptionSchema = z.object({
  body: z.object({
    original: z.string().trim().max(250),
    modelId: z.string().trim(),
    flowId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
  }),
});

interface ProjectDescriptionSuccess {
  original: string;
  enhanced: string;
}

interface ProjectDescriptionFailure {
  error: ApiErrorStatus | Omit<GatewayFailureStatus, "GATEWAY_ERROR">;
  message: string;
}

export type ProjectDescriptionController = ValidatedRequestHandler<
  typeof projectDescriptionSchema,
  ProjectDescriptionSuccess | ProjectDescriptionFailure
>;
