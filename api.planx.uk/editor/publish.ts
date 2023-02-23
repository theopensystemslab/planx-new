import * as jsondiffpatch from "jsondiffpatch";
import { Request, Response, NextFunction } from 'express';
import { adminGraphQLClient as adminClient } from "../hasura";
import { dataMerged, getMostRecentPublishedFlow } from "../helpers";
import { gql } from "graphql-request";
import intersection from "lodash/intersection";

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

    // Check the flattened flow to ensure that all sections (type 360) are still in valid positions (eg within `_root: { edges: [...]}`, not the edge of a portal)
    //   If any are not, don't proceed with publishing and return a message to display in the Editor
    const sectionTypeNodeIds = Object.entries(flattenedFlow).filter(([_nodeId, nodeData]) => nodeData?.type === 360).map(([nodeId, _nodeData]) => nodeId);
    const intersectingNodeIds = intersection(flattenedFlow["_root"].edges, sectionTypeNodeIds);
    if (intersectingNodeIds.length !== sectionTypeNodeIds.length) {
      return res.json({
        alteredNodes: null,
        message: "Error publishing: found Sections in one or more External Portals"
      });
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

export { diffFlow, publishFlow };
