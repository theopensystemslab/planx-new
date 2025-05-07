import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export const updateTemplatedFlowEditsEventSchema = z.object({
  body: z.object({
    createdAt: z.string().pipe(z.coerce.date()),
    payload: z.object({
      flowId: z.string(),
      templatedFrom: z.string().nullable(),
      data: z.any(),
    }),
  }),
});

export type UpdateTemplatedFlowEditsEvent = z.infer<
  typeof updateTemplatedFlowEditsEventSchema
>["body"];

export interface UpdateTemplatedFlowEditsEventResponse {
  message: string;
  data?: any;
}

export type UpdateTemplatedFlowEditsController = ValidatedRequestHandler<
  typeof updateTemplatedFlowEditsEventSchema,
  UpdateTemplatedFlowEditsEventResponse
>;
