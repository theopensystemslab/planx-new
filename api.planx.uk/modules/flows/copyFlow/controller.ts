import { z } from "zod";
import { ServerError } from "../../../errors/index.js";
import { getFlowPermissions } from "../../../helpers.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import type { Flow } from "../../../types.js";
import { copyFlow } from "./service.js";

interface CopyFlowResponse {
  message: string;
  inserted: boolean;
  replaceValue: string;
  data: Flow["data"];
}

interface ErrorResponse {
  error: string;
}

export const copyFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  body: z.object({
    replaceValue: z.string().length(5),
    insert: z.boolean().optional().default(false),
  }),
});

export type CopyFlowController = ValidatedRequestHandler<
  typeof copyFlowSchema,
  CopyFlowResponse | ErrorResponse
>;

export const copyFlowController: CopyFlowController = async (
  _req,
  res,
  next,
) => {
  try {
    const { flowId } = res.locals.parsedReq.params;

    const { isCopiable } = await getFlowPermissions(flowId);

    if (!isCopiable) {
      return res.status(403).json({
        error: "Flow copying is not permitted for this flow",
      });
    }
    const { replaceValue, insert } = res.locals.parsedReq.body;
    const { flow, uniqueFlowData } = await copyFlow(
      flowId,
      replaceValue,
      insert,
    );

    res.status(200).send({
      message: `Successfully copied ${flow.slug}`,
      inserted: insert,
      replaceValue,
      data: uniqueFlowData,
    });
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to copy flow. Error: ${error}` }),
    );
  }
};
