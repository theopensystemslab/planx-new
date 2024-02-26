import { FlowGraph } from "@opensystemslab/planx-core/types";
import { z } from "zod";
import { ServerError } from "../../../errors";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";
import { dataMerged } from "../../../helpers";

type FlattenFlowDataResponse = FlowGraph;

export const flattenFlowData = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  query: z.object({
    unpublished: z
      .string()
      .optional()
      .transform((val) => val?.toLowerCase() === "true"), // proxy for z.boolean()
  }),
});

export type FlattenFlowDataController = ValidatedRequestHandler<
  typeof flattenFlowData,
  FlattenFlowDataResponse
>;

export const flattenFlowDataController: FlattenFlowDataController = async (
  req,
  res,
  next,
) => {
  try {
    const { flowId } = res.locals.parsedReq.params;

    if (req.query?.unpublished?.toString().toLowerCase() === "true") {
      const draftFlattenedFlowData = await dataMerged(flowId, {}, false, true);
      res.status(200).send(draftFlattenedFlowData);
    } else {
      const flattenedFlowData = await dataMerged(flowId);
      res.status(200).send(flattenedFlowData);
    }
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to flatten flow ${res.locals.parsedReq.params?.flowId}: ${error}`,
      }),
    );
  }
};
