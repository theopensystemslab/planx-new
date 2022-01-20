const { GraphQLClient } = require("graphql-request");

const { getFlowData } = require("./helpers");

const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

/**
 * Find and return the node ids and specific data properties that match a given search term, 
 *    and return an updated copy of the flow data if a replaceValue is provided, else return the original flowData
 * 
 * @param {object} flowData - flow data object
 * @param {string} searchTerm - string to "find"
 * @param {string} replaceValue - optional string to "replace" the searchTerm
 * @returns {object}
 */
const getMatches = (flowData, searchTerm, replaceValue = undefined) => {
  const matches = {};

  const nodes = Object.keys(flowData).filter(key => key !== "_root");
  nodes.forEach(node => {
    if (flowData[node]["data"]) {
      // search all "data" properties independent of component type (eg `fn`, `val`, `text`)
      let keys = Object.keys(flowData[node]["data"]);
      keys.forEach(k => {
        // if any value strictly matches the searchTerm, add that node id & key to the matches object
        if (flowData[node]["data"][k] === searchTerm) {
          matches[node] = { data: { 
            [k]: flowData[node]["data"][k] 
          }};
          // if a replaceValue is provided, additionally update the flowData
          if (Boolean(replaceValue)) {
            flowData[node]["data"][k] = replaceValue;
          }
        }
      });
    }
  });

  return {
    matches: matches,
    flowData: flowData,
  };
};

const findInFlow = async (req, res, next) => {
  try {
    const flow = await getFlowData(req.params.flowId);
    const find = req.params.string;

    const matches = getMatches(flow, find)["matches"];
  
    res.json({
      message: `Found ${Object.keys(matches).length} matches of "${find}" in this flow`,
      matches: matches,
    });
  } catch (error) {
    next(error);
  }
};

const findAndReplaceInFlow = async (req, res, next) => {
  if (!req.user?.sub)
    next({ status: 401, message: "User ID missing from JWT" });

  try {
    const flow = await getFlowData(req.params.flowId);
    const find = req.params.string;
    const replace = req.params.value;

    const { matches: matches, flowData: replacedFlowData } = getMatches(flow, find, replace);
    
    // if no matches, send message & exit
    if (Object.keys(matches).length === 0) {
      res.json({
        message: `Didn't find "${find}" in this flow, nothing to replace.`
      });
    }

    // if matches, proceed with mutation to update flow data
    const response = await client.request(
      `
        mutation UpdateFlow(
          $data: jsonb = {},
          $id: uuid!,
        ) {
          update_flows_by_pk(
            pk_columns: {id: $id},
            _set: {
              data: $data,
            },
          ) {
            id
            slug
            data
            updated_at
          }
        }
      `,
      {
        data: replacedFlowData,
        id: req.params.flowId,
      }
    );

    const updatedFlow =
      response.update_flows_by_pk &&
      response.update_flows_by_pk.data;

    res.json({
      message: `Found ${Object.keys(matches).length} matches of "${find}" and replaced with "${replace}"`,
      matches: matches,
      updatedFlow: updatedFlow,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { findInFlow, findAndReplaceInFlow };
