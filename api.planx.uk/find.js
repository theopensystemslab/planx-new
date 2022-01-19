const { GraphQLClient } = require("graphql-request");

const { getFlowData } = require("./helpers");

const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

/**
 * 
 * @param {object} flattenedFlowData 
 * @param {string} searchTerm 
 * @param {string} replaceValue optional
 * @returns {object} 
 */
const getMatches = (flowData, searchTerm, replaceValue = undefined) => {
  const matches = {};

  const nodes = Object.keys(flowData).filter(key => key !== "_root");
  nodes.forEach(node => {
    if (flowData[node]["data"]) {
      let keys = Object.keys(flowData[node]["data"]);
      keys.forEach(k => {
        if (flowData[node]["data"][k] === searchTerm) {
          matches[node] = { data: { 
            [k]: flowData[node]["data"][k] 
          }};
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
    const findText = req.params.string;

    const matches = getMatches(flow, findText)["matches"];
  
    res.json({
      message: `Found ${Object.keys(matches).length} occurrances of "${findText}" in this flow`,
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
    const findText = req.params.string;
    const replaceText = req.params.value;

    const matches = getMatches(flow, findText)["matches"];

    if (Object.keys(matches).length === 0) {
      res.json({
        message: `Didn't find any instances of "${findText}" in this flow, nothing to replace.`
      });
    }

    const updatedFlowData = getMatches(flow, findText, replaceText)["flowData"];

    if (updatedFlowData) {
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
          data: updatedFlowData,
          id: req.params.flowId,
        }
      );

      const updatedFlow =
        response.update_flows_by_pk &&
        response.update_flows_by_pk.data;

      res.json({
        message: `Found ${Object.keys(matches).length} occurances of "${findText}" and replaced with "${replaceText}"`,
        matches: matches,
        updatedFlow: updatedFlow,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { findInFlow, findAndReplaceInFlow };
