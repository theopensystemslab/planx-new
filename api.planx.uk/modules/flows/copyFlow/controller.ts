import { z } from "zod";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";
import { Flow } from "../../../types";
import { ServerError } from "../../../errors";
import { copyFlow } from "./service";

interface CopyFlowResponse {
  message: string;
  inserted: boolean;
  replaceValue: string;
  data: Flow["data"];
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
  CopyFlowResponse
>;

export const copyFlowController: CopyFlowController = async (
  _req,
  res,
  next,
) => {
  try {
    const { flowId } = res.locals.parsedReq.params;
    const { replaceValue, insert } = res.locals.parsedReq.body;
    const { flow, uniqueFlowData } = await copyFlow(
      flowId,
      replaceValue,
      insert,
    );

    res.status(200).send({
      message: `Successfully copied ${flow.slug}`,
      inserted: insert,
      replaceValue: replaceValue,
      data: uniqueFlowData,
    });
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to copy flow. Error: ${error}`}),
    );
  }
};
