import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { z } from "zod";
import { ServerError } from "../../../errors/index.js";
import { archiveFlow } from "./service.js";

interface ArchiveFlowResponse {
  message: string;
  flowName: string;
}

export const archiveFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
    teamSlug: z.string(),
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
    const { flowId, teamSlug } = res.locals.parsedReq.params;
    const {name: flowName} = await archiveFlow(flowId, teamSlug);

    res.status(200).send({
      message: `Successfully archived flow with id ${flowId} from ${teamSlug}`,
      flowName: flowName
    });
  } catch (error) {
    return next(new ServerError({ message: `Failed to move flow: ${error}` }));
  }
};
