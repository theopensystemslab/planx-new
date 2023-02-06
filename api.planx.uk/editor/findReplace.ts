import { Flow } from "./../types";
import { adminGraphQLClient as adminClient } from "../hasura";
import { gql } from "graphql-request";
import { getFlowData } from "../helpers";
import { Request, Response, NextFunction } from "express";

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
  replaceValue: string | undefined = undefined
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

const findAndReplaceInFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | NextFunction | void> => {
  try {
    if (!req.user?.sub)
      return next({ status: 401, message: "User ID missing from JWT" });

    const flow = await getFlowData(req.params.flowId);
    if (!flow) return next({ status: 401, message: "Unknown flowId" });

    const { find, replace } = req.query as Record<string, string>;
    if (!find)
      return next({
        status: 401,
        message: `Expected at least one query parameter "find"`,
      });

    if (find && !replace) {
      const matches = getMatches(flow.data, find)["matches"];

      res.json({
        message: `Found ${
          Object.keys(matches).length
        } matches of "${find}" in this flow`,
        matches: matches,
      });
    }

    if (find && replace) {
      const { matches, flowData } = getMatches(flow.data, find, replace);

      // if no matches, send message & exit
      if (Object.keys(matches).length === 0) {
        res.json({
          message: `Didn't find "${find}" in this flow, nothing to replace`,
        });
      }

      // if matches, proceed with mutation to update flow data
      const response = await adminClient.request(
        gql`
          mutation UpdateFlow($data: jsonb = {}, $id: uuid!) {
            update_flows_by_pk(pk_columns: { id: $id }, _set: { data: $data }) {
              id
              slug
              data
              updated_at
            }
          }
        `,
        {
          data: flowData,
          id: req.params.flowId,
        }
      );

      const updatedFlow =
        response.update_flows_by_pk && response.update_flows_by_pk.data;

      res.json({
        message: `Found ${
          Object.keys(matches).length
        } matches of "${find}" and replaced with "${replace}"`,
        matches: matches,
        updatedFlow: updatedFlow,
      });
    }
  } catch (error) {
    next(error);
  }
};

export { findAndReplaceInFlow };
