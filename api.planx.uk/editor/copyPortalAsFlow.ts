import { getFlowData, getChildren, makeUniqueFlow } from "../helpers";
import { Request, Response, NextFunction } from "express";
import { Flow } from "../types";

/**
 * Copies an internal portal and transforms it to be an independent flow
 */
const copyPortalAsFlow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return next({ status: 401, message: "User ID missing from JWT" });
    }

    // fetch the parent flow data
    const flow = await getFlowData(req.params.flowId);
    if (!flow) {
      return next({ status: 404, message: "Unknown flowId" });
    }

    // confirm that the node id provided is a valid portal
    const portalId = req.params.portalNodeId;
    if (
      !Object.keys(flow.data).includes(portalId) ||
      flow.data[portalId]?.type !== 300
    ) {
      return next({ status: 404, message: "Unknown portalNodeId" });
    }

    // set the portal node as the new "_root", then extract all its' children from the parent flow and add them to the new flow data object
    let portalData: Flow["data"] = {
      _root: { edges: flow.data[portalId]?.edges },
    };
    Object.entries(portalData).forEach(([_nodeId, node]) => {
      portalData = getChildren(node, flow.data, portalData);
    });

    // to avoid the new flow nodes acting as clones of the original internal portal, rename
    //   the non-root node ids using the first three alphanumeric characters of the portal name
    const replacementCharacters = flow.data[portalId]?.data?.text
      ?.replace(/\W/g, "")
      ?.slice(0, 3);
    portalData = makeUniqueFlow(portalData, replacementCharacters);

    // FUTURE:
    //   - change GET to POST and write portalData directly to a new flow?
    //     - assume same team as parent flow and use name of internal portal as slug, or pass in body?
    //   - update the parent flow to remove the original internal portal and reference this new flow as an external portal?

    res.status(200).send({
      message: `Successfully copied internal portal: ${flow.data[portalId]?.data?.text}`,
      data: portalData,
    });
  } catch (error) {
    return next(error);
  }
};

export { copyPortalAsFlow };
