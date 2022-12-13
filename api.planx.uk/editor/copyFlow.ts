import { Request, Response, NextFunction } from "express";
import { makeUniqueFlow, getFlowData, insertFlow } from "../helpers";
import { Flow } from "../types";

const copyFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | NextFunction | void> => {
  try {
    if (!req.user?.sub) {
      return next({ status: 401, message: "User ID missing from JWT" });
    }

    // Fetch the original flow
    const flow: Flow = await getFlowData(req.params.flowId);

    // Ensure the newly copied flow has unique nodeIds
    const randomReplacementCharacters = Math.random().toString(36).slice(2,6);
    const uniqueFlowData = makeUniqueFlow(flow.data, randomReplacementCharacters);

    // Check if copied flow data should be inserted into `flows` table, or just returned for reference
    const shouldInsert = Boolean(req.body?.insert);
    if (shouldInsert) {
      const newSlug = flow.slug + "-copy";
      // Insert the flow and an associated operation
      await insertFlow(flow.team_id, newSlug, uniqueFlowData);
    }

    res.status(200).send({
      message: `Successfully copied ${flow.slug}`,
      inserted: shouldInsert,
      replaceValue: randomReplacementCharacters,
      data: uniqueFlowData,
    });
  } catch (error) {
    return next(error);
  }
};

export { copyFlow };
