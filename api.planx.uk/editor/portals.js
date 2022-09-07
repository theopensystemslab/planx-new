import { getFlowData } from "../helpers";

/**
 * Copies an internal portal and transforms it to be an independent flow
 */
const copyPortalAsFlow = async (req, res, next) => {
  try {
    if (!req.user?.sub)
      return next({ status: 401, message: "User ID missing from JWT" });

    // fetch the parent flow data
    const flow = await getFlowData(req.params.flowId);
    if (!flow) return next({ status: 401, message: "Unknown flowId" });

    // confirm that the node id provided is a valid portal
    const portalId = req.params.portalNodeId;
    if (!Object.keys(flow.data).includes(portalId) || flow.data[portalId]?.type !== 300)
      return next({ status: 401, message: "Unknown portalNodeId" });

    // set the portal node as the new "_root", then extract all its' children from the parent flow and add them to the new flow data object
    let portalData = { "_root": { "edges": flow.data[portalId]?.edges }};
    Object.entries(portalData).forEach(([nodeId, node]) => {
      portalData = getChildren(node, flow.data, portalData);
    });

    // to avoid the new flow nodes acting as clones of the original internal portal, rename 
    //   the non-root node ids using the first three alphanumeric characters of the portal name
    const replacementCharacters = flow.data[portalId]?.data?.text?.replace(/\W/g, '')?.slice(0,3);
    portalData = makeUniqueFlow(portalData, replacementCharacters);

    // FUTURE: 
    //   - change GET to POST and write portalData directly to a new flow? 
    //     - assume same team as parent flow and use name of internal portal as slug, or pass in body?
    //   - update the parent flow to remove the original internal portal and reference this new flow as an external portal?

    res.status(200).send({ 
      message: `Successfully copied internal portal: ${flow.data[portalId]?.data?.text}`,
      data: portalData
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * For any node with edges, recursively find all of its' children nodes and return them as their own flow-like data structure
 * @param {object} node
 * @param {object} originalFlow - the original parent flow data
 * @param {object} newFlow - the new flow data
 * @returns {object} - the new flow data with child nodes included
 */
const getChildren = (node, originalFlow, newFlow) => {
  if (node.edges) {
    node.edges.forEach((edgeId) => {
      if (!Object.keys(newFlow).includes(edgeId)) {
        newFlow[edgeId] = originalFlow[edgeId];
        getChildren(originalFlow[edgeId], originalFlow, newFlow);
      }
    });
  }

  return newFlow;
};

/**
 * For a given flow, make it unique by renaming its' node ids (replace last n characters) while preserving its' content
 * @param {object} flowData
 * @param {string} replaceValue
 * @returns {object} flowData with updated node ids
 */
 const makeUniqueFlow = (flowData, replaceValue) => {
  const charactersToReplace = replaceValue.length;

  Object.keys(flowData).forEach((node) => {
    // if this node has edges, rename them (includes _root.edges)
    if (flowData[node]["edges"]) {
      const newEdges = flowData[node]["edges"].map(
        (edge) => edge.slice(0, -charactersToReplace) + replaceValue
      );
      delete flowData[node]["edges"];
      flowData[node]["edges"] = newEdges;
    }

    // rename this top-level node if it's not _root
    if (node !== "_root") {
      const newNodeId = node.slice(0, -charactersToReplace) + replaceValue;
      flowData[newNodeId] = flowData[node];
      delete flowData[node];
    }
  });

  return flowData;
};

export { copyPortalAsFlow };
