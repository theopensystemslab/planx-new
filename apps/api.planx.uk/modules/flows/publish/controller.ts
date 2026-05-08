import type { Node } from "@opensystemslab/planx-core/types";
import { z } from "zod";

import { ServerError } from "../../../errors/index.js";
import type { CreateScheduledEventResponse } from "../../../lib/hasura/metadata/types.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { publishFlow } from "./service.js";

interface PublishFlowResponse {
  message: string;
  alteredNodes?: Node[];
  templatedFlowsScheduledEventsResponse?: CreateScheduledEventResponse[];
}

export const publishFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  query: z.object({
    summary: z.string(),
    // Keep max in sync with `apiLimit` in server.ts
    templatedFlowIds: z.array(z.string()).max(100).optional(),
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
    const { summary, templatedFlowIds } = res.locals.parsedReq.query;
    const response = await publishFlow(flowId, summary, templatedFlowIds);

    return res.json({
      message: response?.alteredNodes
        ? "Changes published"
        : "No new changes to publish",
      alteredNodes: response?.alteredNodes,
      templatedFlowsScheduledEventsResponse:
        response?.templatedFlowsScheduledEventsResponse,
    });
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to publish flow: ${error}` }),
    );
  }
};
