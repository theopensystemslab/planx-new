import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { z } from "zod";
import { ServerError } from "../../../errors/index.js";
import { archiveFlow } from "./service.js";

interface ArchiveFlowResponse {
  message: string;
}

export const archiveFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
});

export type ArchiveFlowController = ValidatedRequestHandler<
  typeof archiveFlowSchema,
  ArchiveFlowResponse
>;

export const archiveFlowController: ArchiveFlowController = async (
  _req,
  res,
  next,
) => {
  try {
    const { flowId } = res.locals.parsedReq.params;
    const {name: flowName} = await archiveFlow(flowId);

    res.status(200).send({
      message: `Successfully archived ${flowName} with id ${flowId}`,
    });
  } catch (error) {
    return next(new ServerError({ message: `Failed to archive flow: ${error}` }));
  }
};
