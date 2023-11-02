import { Flow } from "./../types";
import { gql } from "graphql-request";
import { getFlowData } from "../helpers";
import { Request, Response, NextFunction } from "express";
import { getClient } from "../client";
import { FlowGraph } from "@opensystemslab/planx-core/types";

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

/**
 * @swagger
 * /flows/{flowId}/search:
 *  post:
 *    summary: Find and replace
 *    description: Find and replace a data variable in a flow
 *    tags:
 *      - flows
 *    parameters:
 *      - in: path
 *        name: flowId
 *        type: string
 *        required: true
 *      - in: query
 *        name: find
 *        type: string
 *        required: true
 *      - in: query
 *        name: replace
 *        type: string
 *        required: false
 *    responses:
 *      '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  required: true
 *                matches:
 *                  type: object
 *                  required: true
 *                  additionalProperties: true
 *                updatedFlow:
 *                  type: object
 *                  required: false
 *                  additionalProperties: true
 *                  properties:
 *                    _root:
 *                      type: object
 *                      properties:
 *                        edges:
 *                          type: array
 *                          items:
 *                            type: string
 */
const findAndReplaceInFlow = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | NextFunction | void> => {
  try {
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
      const { client: $client } = getClient();
      const response = await $client.request<UpdateFlow>(
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
          id: req.params.flowId,
        },
      );

      const updatedFlow = response.flow && response.flow.data;

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
