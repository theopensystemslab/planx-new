import { ValidatedRequestHandler } from "../../../shared/middleware/validate";
import { z } from "zod";
import { ServerError } from "../../../errors";
import { moveFlow } from "./service";

interface MoveFlowResponse {
  message: string;
}

export const moveFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
    teamSlug: z.string(),
  }),
});

export type MoveFlowController = ValidatedRequestHandler<
  typeof moveFlowSchema,
  MoveFlowResponse
>;

export const moveFlowController: MoveFlowController = async (
  _req,
  res,
  next,
) => {
  try {
    const { flowId, teamSlug } = res.locals.parsedReq.params;
    await moveFlow(flowId, teamSlug);

    res.status(200).send({
      message: `Successfully moved flow to ${teamSlug}`,
    });
  } catch (error) {
    return next(new ServerError({ message: `Failed to move flow: ${error}` }));
  }
};
