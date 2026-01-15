import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import type { ErrorStatus } from "../types.js";

export const projectDescriptionSchema = z.object({
  body: z.object({
    original: z.string().trim().max(250),
    modelId: z.string().trim().min(3),
  }),
});

interface ProjectDescriptionSuccess {
  original: string;
  enhanced: string;
}

interface ProjectDescriptionFailure {
  error: ErrorStatus;
  message: string;
}

export type ProjectDescriptionController = ValidatedRequestHandler<
  typeof projectDescriptionSchema,
  ProjectDescriptionSuccess | ProjectDescriptionFailure
>;
