import { getFlowData, getChildren, makeUniqueFlow } from "../../../helpers";
import { Flow } from "../../../types";

/**
 * Copies an internal portal and transforms it to be an independent flow
 */
const copyPortalAsFlow = async (flowId: string, portalNodeId: string) => {
  // fetch the parent flow data
  const flow = await getFlowData(flowId);

  // confirm that the node id provided is a valid portal
  if (
    !Object.keys(flow.data).includes(portalNodeId) ||
    flow.data[portalNodeId]?.type !== 300
  ) {
    throw Error("Unknown portalNodeId");
  }

  // set the portal node as the new "_root", then extract all its' children from the parent flow and add them to the new flow data object
  let portalData: Flow["data"] = {
    _root: { edges: flow.data[portalNodeId]?.edges },
  };
  Object.entries(portalData).forEach(([_nodeId, node]) => {
    portalData = getChildren(node, flow.data, portalData);
  });

  // to avoid the new flow nodes acting as clones of the original internal portal, rename
  //   the non-root node ids using the first three alphanumeric characters of the portal name
  const replacementCharacters = flow.data[portalNodeId]?.data?.text
    ?.replace(/\W/g, "")
    ?.slice(0, 3);
  portalData = makeUniqueFlow(portalData, replacementCharacters);

  // FUTURE:
  //   - change GET to POST and write portalData directly to a new flow?
  //     - assume same team as parent flow and use name of internal portal as slug, or pass in body?
  //   - update the parent flow to remove the original internal portal and reference this new flow as an external portal?
  return { flow, portalData };
};

export { copyPortalAsFlow };
