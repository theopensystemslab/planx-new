import { Flow } from "../../../types";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";
import { z } from "zod";
import { ServerError } from "../../../errors";
import { findAndReplaceInFlow } from "./service";
import { FlowGraph } from "@opensystemslab/planx-core/types";

interface FindAndReplaceResponse {
  message: string;
  matches: Flow["data"] | null;
  updatedFlow?: FlowGraph;
}

export const findAndReplaceSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  query: z.object({
    find: z.string(),
    replace: z.string().optional(),
  }),
});

export type FindAndReplaceController = ValidatedRequestHandler<
  typeof findAndReplaceSchema,
  FindAndReplaceResponse
>;

const findAndReplaceController: FindAndReplaceController = async (
  _req,
  res,
  next,
) => {
  try {
    const { flowId } = res.locals.parsedReq.params;
    const { find, replace } = res.locals.parsedReq.query;
    const { matches, updatedFlow, message } = await findAndReplaceInFlow(
      flowId,
      find,
      replace,
    );

    res.json({ message, matches, updatedFlow });
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to find and replace: ${error}` }),
    );
  }
};

export { findAndReplaceController };
