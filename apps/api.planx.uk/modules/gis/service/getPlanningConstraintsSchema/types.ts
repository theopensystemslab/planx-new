import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export const getPlanningConstraintsSchemaRequestSchema = z.object({
  query: z.object({
    localAuthority: z.string().optional(),
  }),
});

type Success = Array<string>;

interface Failure {
  error: string;
}

export type GetPlanningConstraintsSchemaRequest = ValidatedRequestHandler<
  typeof getPlanningConstraintsSchemaRequestSchema,
  Success | Failure
>;
