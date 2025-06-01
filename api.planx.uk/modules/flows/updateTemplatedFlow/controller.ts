import { z } from "zod";
import { ServerError } from "../../../errors/serverError.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const updateTemplatedFlowEventSchema = z.object({
  payload: z.object({
    comment: z.string(),
    created_at: z.string().pipe(z.coerce.date()),
    id: z.string(),
    payload: z.object({
      sourceFlowId: z.string(),
      templatedFlowId: z.string(),
      summary: z.string(),
    }),
    scheduled_time: z.string().pipe(z.coerce.date()),
  }),
});

export interface UpdateTemplatedFlowResponse {
  message: string;
  data?: any;
}

export type UpdateTemplatedFlowController = ValidatedRequestHandler<
  typeof updateTemplatedFlowEventSchema,
  UpdateTemplatedFlowResponse
>;

export const updateTemplatedFlowController: UpdateTemplatedFlowController =
  async (_req, res, next) => {
    console.log(res.locals.parsedReq);
    const { sourceFlowId } = res.locals.parsedReq.payload.payload;

    try {
      res.json({ message: "WIP" });
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to update templated flow on source publish (source ID ${sourceFlowId})`,
          cause: error,
        }),
      );
    }
  };
