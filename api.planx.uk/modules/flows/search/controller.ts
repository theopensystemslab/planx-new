import { z } from "zod";
import { ServerError } from "../../../errors";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { searchFlowData } from "./service";

export const searchFlowDataSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  query: z.object({
    searchTerm: z.string(),
    facet: z.enum(["data"]),
  }),
});

export interface SearchResult {
  nodeId: string;
  nodeType: ComponentType;
  nodeTitle?: string;
  text: string;
  path: string[];
}

export type SearchFlowDataController = ValidatedRequestHandler<
  typeof searchFlowDataSchema,
  SearchResult[]
>;

const searchFlowDataController: SearchFlowDataController = async (
  _req,
  res,
  next
) => {
  try {
    const { flowId } = res.locals.parsedReq.params;
    const { searchTerm, facet } = res.locals.parsedReq.query;
    const results = await searchFlowData({
      flowId,
      searchTerm,
      facet,
    });

    res.json(results);
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to search: ${error}` })
    );
  }
};

export { searchFlowDataController };