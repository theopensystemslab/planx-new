import type { Node } from "@opensystemslab/planx-core/types";
import { z } from "zod";

import { ServerError } from "../../../errors/index.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { publishFlow } from "./service.js";

interface PublishFlowResponse {
  message: string;
  alteredNodes?: Node[];
}

export const publishFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  body: z.object({
    summary: z.string(),
    templatedFlowIds: z.array(z.string()).optional(),
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
    const { summary, templatedFlowIds } = res.locals.parsedReq.body;
    const response = await publishFlow(flowId, summary, templatedFlowIds);

    return res.json({
      message: response?.alteredNodes
        ? "Changes published"
        : "No new changes to publish",
      alteredNodes: response?.alteredNodes,
    });
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to publish flow: ${error}` }),
    );
  }
};
