import { Request, Response, NextFunction } from "express";
import { makeUniqueFlow, getFlowData, insertFlow } from "../helpers";
import { Flow } from "../types";

const copyFlow = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | NextFunction | void> => {
  try {
    if (!req.user?.sub) {
      return next({ status: 401, message: "User ID missing from JWT" });
    }

    if (!req.params?.flowId || !req.body?.replaceValue) {
      return next({
        status: 400,
        message: "Missing required values to proceed",
      });
    }

    // Fetch the original flow
    const flow: Flow = await getFlowData(req.params.flowId);

    // Generate new flow data which is an exact "content" copy of the original but with unique nodeIds
    const uniqueFlowData = makeUniqueFlow(flow.data, req.body.replaceValue);

    // Check if copied flow data should be inserted into `flows` table, or just returned for reference
    const shouldInsert = (req.body?.insert as boolean) || false;
    if (shouldInsert) {
      const newSlug = flow.slug + "-copy";
      const creatorId = parseInt(req.user.sub, 10);
      // Insert the flow and an associated operation
      await insertFlow(
        flow.team_id,
        newSlug,
        uniqueFlowData,
        creatorId,
        req.params.flowId,
      );
    }

    res.status(200).send({
      message: `Successfully copied ${flow.slug}`,
      inserted: shouldInsert,
      replaceValue: req.body.replaceValue,
      data: uniqueFlowData,
    });
  } catch (error) {
    return next(error);
  }
};

export { copyFlow };
