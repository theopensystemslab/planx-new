import { FlowGraph } from "@opensystemslab/planx-core/types";
import { z } from "zod";
import { ServerError } from "../../../errors";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";
import { getFlattenedFlowData } from "./service";

type FlattenFlowDataResponse = FlowGraph;

export const flattenFlowData = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  query: z.object({
    unpublished: z.string().optional(), // TODO make boolean
  }),
});

export type FlattenFlowDataController = ValidatedRequestHandler<
  typeof flattenFlowData,
  FlattenFlowDataResponse
>;

export const flattenFlowDataController: FlattenFlowDataController =
  async (req, res, next) => {
    try {
      const { flowId } = res.locals.parsedReq.params;

      if (req.query?.unpublished) { 
        const unpublishedFlattenedFlowData = await getFlattenedFlowData(flowId, true);
        res.status(200).send(unpublishedFlattenedFlowData);
      } else {
        const flattenedFlowData = await getFlattenedFlowData(flowId);
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
