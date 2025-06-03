import { z } from "zod";
import { ServerError } from "../../../errors/serverError.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const updateTemplatedFlowEventSchema = z.object({
  body: z.object({
    payload: z.object({
      sourceFlowId: z.string(),
      templatedFlowId: z.string(),
      summary: z.string(),
    }),
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
    const { sourceFlowId, templatedFlowId, summary } =
      res.locals.parsedReq.body.payload;

    try {
      res.status(200).send({
        message: `Successfully queued up event to update ${templatedFlowId}`,
      });
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to update templated flow on source publish (source ID ${sourceFlowId}, templated flow ID ${templatedFlowId})`,
          cause: error,
        }),
      );
    }
  };
