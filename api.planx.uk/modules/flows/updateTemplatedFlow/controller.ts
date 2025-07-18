import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { z } from "zod";

import { ServerError } from "../../../errors/serverError.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { updateTemplatedFlow } from "./service.js";

export const updateTemplatedFlowEventSchema = z.object({
  body: z.object({
    payload: z.object({
      sourceFlowId: z.string(),
      templatedFlowId: z.string(),
    }),
  }),
});

export interface UpdateTemplatedFlowResponse {
  message: string;
  data: {
    templatedFlowData: FlowGraph;
    commentId: number;
  };
}

export type UpdateTemplatedFlowController = ValidatedRequestHandler<
  typeof updateTemplatedFlowEventSchema,
  UpdateTemplatedFlowResponse
>;

export const updateTemplatedFlowController: UpdateTemplatedFlowController =
  async (_req, res, next) => {
    const { sourceFlowId, templatedFlowId } = res.locals.parsedReq.body.payload;

    try {
      const response = await updateTemplatedFlow(sourceFlowId, templatedFlowId);

      res.status(200).send({
        message: `Successfully updated templated flow on source publish (source ID ${sourceFlowId}, templated flow ID ${templatedFlowId})`,
        data: response,
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
