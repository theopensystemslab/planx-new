import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { GatewayFailureStatus } from "../../../ai/types.js";

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
