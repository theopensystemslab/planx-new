import type { Node } from "@opensystemslab/planx-core/types";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { z } from "zod";
import { publishFlow } from "./service.js";
import { ServerError } from "../../../errors/index.js";

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
    return next(
      new ServerError({ message: `Failed to publish flow: ${error}` }),
    );
  }
};
