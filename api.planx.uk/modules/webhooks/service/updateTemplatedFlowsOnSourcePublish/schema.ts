import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export const updateTemplatedFlowsOnSourcePublishEventSchema = z.object({
  body: z.object({
    createdAt: z.string().pipe(z.coerce.date()),
    payload: z.object({
      flowId: z.string(),
    }),
  }),
});

export type UpdateTemplatedFlowsOnSourcePublishEvent = z.infer<
  typeof updateTemplatedFlowsOnSourcePublishEventSchema
>["body"];

export interface UpdateTemplatedFlowsOnSourcePublishEventResponse {
  message: string;
  data?: any;
}

export type UpdateTemplatedFlowsOnSourcePublishController =
  ValidatedRequestHandler<
    typeof updateTemplatedFlowsOnSourcePublishEventSchema,
    UpdateTemplatedFlowsOnSourcePublishEventResponse
  >;
