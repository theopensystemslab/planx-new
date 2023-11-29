import { gql } from "graphql-request";
import { getFlowData } from "../../../helpers";
import { $api } from "../../../client";
import { FlowGraph } from "@opensystemslab/planx-core/types";
import { Flow } from "../../../types";

interface MatchResult {
  matches: Flow["data"];
  flowData: Flow["data"];
}

/**
 * Find and return the node ids and specific data properties that match a given search term,
 *    and return an updated copy of the flow data if a replaceValue is provided, else return the original flowData
 */
const getMatches = (
  flowData: Flow["data"],
  searchTerm: string,
  replaceValue: string | undefined = undefined,
): MatchResult => {
  const matches: MatchResult["matches"] = {};

  const nodes = Object.keys(flowData).filter((key) => key !== "_root");
  nodes.forEach((node) => {
    const data = flowData[node]["data"];
    if (data) {
      // search all "data" properties independent of component type (eg `fn`, `val`, `text`)
      const keys = Object.keys(data);
      keys.forEach((k) => {
        // if any value strictly matches the searchTerm, add that node id & key to the matches object
        if (data[k] === searchTerm) {
          matches[node] = {
            data: {
              [k]: data[k],
            },
          };
          // if a replaceValue is provided, additionally update the flowData
          if (replaceValue) {
            data[k] = replaceValue;
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

interface UpdateFlow {
  flow: {
    id: string;
    slug: string;
    data: FlowGraph;
    updatedAt: string;
  };
}

const findAndReplaceInFlow = async (
  flowId: string,
  find: string,
  replace?: string,
) => {
  const flow = await getFlowData(flowId);
  if (!flow) throw Error("Unknown flowId");

  // Find
  if (!replace) {
    const { matches } = getMatches(flow.data, find);
    const message = `Found ${
      Object.keys(matches).length
    } matches of "${find}" in this flow`;
    return { matches, message };
  }

  // Find & Replace
  const { matches, flowData } = getMatches(flow.data, find, replace);

  if (Object.keys(matches).length === 0) {
    const message = `Didn't find "${find}" in this flow, nothing to replace`;
    return { matches: null, message };
  }

  // if matches, proceed with mutation to update flow data

  // XXX: This is using the API Hasura role
  // If Find and Replace functionality is expanded to roles other than platformAdmin we'll need a manual permission check here to ensure that the user has permission to update the flows.data column
  const response = await $api.client.request<UpdateFlow>(
    gql`
      mutation UpdateFlow($data: jsonb = {}, $id: uuid!) {
        flow: update_flows_by_pk(
          pk_columns: { id: $id }
          _set: { data: $data }
        ) {
          id
          slug
          data
          updatedAt: updated_at
        }
      }
    `,
    {
      data: flowData,
      id: flowId,
    },
  );

  const updatedFlow = response.flow && response.flow.data;
  const message = `Found ${
    Object.keys(matches).length
  } matches of "${find}" and replaced with "${replace}"`;

  return { matches, message, updatedFlow };
};

export { findAndReplaceInFlow };
