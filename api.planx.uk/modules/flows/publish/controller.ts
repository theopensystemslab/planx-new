import { Node } from "@opensystemslab/planx-core/types";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";
import { z } from "zod";
import { publishFlow } from "./service";

interface PublishFlowResponse {
  message: string;
  alteredNodes: Node[] | null;
}

export const publishFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  query: z.object({
    summary: z.string().optional(),
  }),
});

export type PublishFlowController = ValidatedRequestHandler<
  typeof publishFlowSchema,
  PublishFlowResponse
>;

export const publishFlowController: PublishFlowController = async (
  _req,
  res,
  next,
) => {
  try {
    const { flowId } = res.locals.parsedReq.params;
    const { summary } = res.locals.parsedReq.query;
    const alteredNodes = await publishFlow(flowId, summary);

    return res.json({
      alteredNodes,
      message: alteredNodes ? "Changes published" : "No new changes to publish",
    });
  } catch (error) {
    return next(error);
  }
};
