import { z } from "zod";
import type { Flow } from "../../../types.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { copyPortalAsFlow } from "./service.js";
import { ServerError } from "../../../errors/index.js";

interface CopyFlowAsPortalResponse {
  message: string;
  data: Flow["data"];
}

export const copyFlowAsPortalSchema = z.object({
  params: z.object({
    flowId: z.string(),
    portalNodeId: z.string(),
  }),
});

export type CopyFlowAsPortalController = ValidatedRequestHandler<
  typeof copyFlowAsPortalSchema,
  CopyFlowAsPortalResponse
>;

const copyPortalAsFlowController: CopyFlowAsPortalController = async (
  _req,
  res,
  next,
) => {
  try {
    const { flowId, portalNodeId } = res.locals.parsedReq.params;
    const { flow, portalData } = await copyPortalAsFlow(flowId, portalNodeId);

    res.status(200).send({
      message: `Successfully copied internal portal: ${flow.data[portalNodeId]?.data?.text}`,
      data: portalData,
    });
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to copy flow as portal: ${error}` }),
    );
  }
};

export { copyPortalAsFlowController };
