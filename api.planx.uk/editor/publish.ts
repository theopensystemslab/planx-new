import * as jsondiffpatch from "jsondiffpatch";
import { Request, Response, NextFunction } from 'express';
import { adminGraphQLClient as adminClient } from "../hasura";
import { dataMerged, getMostRecentPublishedFlow } from "../helpers";
import { gql } from "graphql-request";
import intersection from "lodash/intersection";
import { flattenDeep } from "lodash";

const diffFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | NextFunction | void> => {
  if (!req.user?.sub)
    return next({ status: 401, message: "User ID missing from JWT" });

  try {
    const flattenedFlow = await dataMerged(req.params.flowId);
    const mostRecent = await getMostRecentPublishedFlow(req.params.flowId);

    const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

    if (delta) {
      const alteredNodes = Object.keys(delta).map((key) => ({
        id: key,
        ...flattenedFlow[key]
      }));

      return res.json({
        alteredNodes
      });
    } else {
      return res.json({
        alteredNodes: null,
        message: "No new changes",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const publishFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | NextFunction | void> => {
  if (!req.user?.sub)
    return next({ status: 401, message: "User ID missing from JWT" });

  try {
    const flattenedFlow = await dataMerged(req.params.flowId);

    // If the flattened flow (including external portals) has sections, handle validations
    if (getSectionNodeIds(flattenedFlow)?.length > 0) {
      if (!sectionIsInFirstPosition(flattenedFlow)) {
        return res.json({
          alteredNodes: null,
          message: "Error publishing: when using Sections, your flow needs to start with a Section"
        });
      } 
      if (!allSectionsOnRoot(flattenedFlow)) {
        return res.json({
          alteredNodes: null,
          message: "Error publishing: found Sections in one or more External Portals, but Sections are only allowed in main flow"
        });
      }
    }

    const mostRecent = await getMostRecentPublishedFlow(req.params.flowId);
    const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

    if (delta) {
      const response = await adminClient.request(
        gql`
          mutation PublishFlow(
            $data: jsonb = {},
            $flow_id: uuid,
            $publisher_id: Int,
            $summary: String,
          ) {
            insert_published_flows_one(object: {
              data: $data,
              flow_id: $flow_id,
              publisher_id: $publisher_id,
              summary: $summary,
            }) {
              id
              flow_id
              publisher_id
              created_at
              data
            }
          }
        `,
        {
          data: flattenedFlow,
          flow_id: req.params.flowId,
          publisher_id: parseInt(req.user.sub, 10),
          summary: req.query?.summary || null,
        }
      );

      const publishedFlow =
        response.insert_published_flows_one &&
        response.insert_published_flows_one.data;

      const alteredNodes = Object.keys(delta).map((key) => ({
        id: key,
        ...publishedFlow[key],
      }));

      return res.json({
        alteredNodes,
      });
    } else {
      return res.json({
        alteredNodes: null,
        message: "No new changes",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const getSectionNodeIds = (flow: Record<string, any>): string[] => {
  return Object.entries(flow).filter(([_nodeId, nodeData]) => nodeData?.type === 360)?.map(([nodeId, _nodeData]) => nodeId);
};

const sectionIsInFirstPosition = (flow: Record<string, any>): boolean => {
  const firstNodeId = flow["_root"].edges[0];
  return flow[firstNodeId].type === 360;
};

const allSectionsOnRoot = (flow: Record<string, any>): boolean => {
  const sectionTypeNodeIds = getSectionNodeIds(flow);
  const intersectingNodeIds = intersection(flow["_root"].edges, sectionTypeNodeIds);
  return intersectingNodeIds.length === sectionTypeNodeIds.length;
};

export { diffFlow, publishFlow };
