import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { ACCEPTED_MODEL_IDS } from "../constants.js";
import {
  GATEWAY_STATUS,
  GATEWAY_SUCCESS_STATUSES,
  type ApiErrorStatus,
  type GatewayFailureStatus,
} from "../types.js";

export const projectDescriptionSchema = z.object({
  body: z.object({
    original: z.string().trim().max(250),
    flowId: z.string().uuid(),
    modelId: z.enum(ACCEPTED_MODEL_IDS).default("google/gemini-2.5-pro"),
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

export const projectDescriptionObjectResultSchema = z.object({
  enhancedDescription: z.string().trim().max(250),
  status: z.enum([...GATEWAY_SUCCESS_STATUSES, GATEWAY_STATUS.INVALID]),
});
