import type { Node } from "@opensystemslab/planx-core/types";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { z } from "zod";
import { publishFlow } from "./service.js";
import { ServerError } from "../../../errors/index.js";
import type { ScheduledEventResponse } from "../../../lib/hasura/metadata/index.js";

interface PublishFlowResponse {
  message: string;
  alteredNodes?: Node[];
  templatedFlowsScheduledEventsResponse?: ScheduledEventResponse[];
}

export const publishFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  query: z.object({
    summary: z.string(),
    templatedFlowIds: z
      .string()
      .optional()
      .transform((z) => z?.split(",")),
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
