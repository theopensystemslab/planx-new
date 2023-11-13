import * as jsondiffpatch from "jsondiffpatch";
import { Request, Response, NextFunction } from "express";
import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers";
import { gql } from "graphql-request";
import { FlowGraph } from "@opensystemslab/planx-core/types";
import { userContext } from "../../auth/middleware";
import { getClient } from "../../../client";

interface PublishFlow {
  publishedFlow: {
    id: string;
    flowId: string;
    publisherId: string;
    createdAt: string;
    data: FlowGraph;
  };
}

export const publishFlow = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | NextFunction | void> => {
  try {
    const flattenedFlow = await dataMerged(req.params.flowId);
    const mostRecent = await getMostRecentPublishedFlow(req.params.flowId);
    const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

    const userId = userContext.getStore()?.user?.sub;
    if (!userId) throw Error("User details missing from request");

    if (delta) {
      const { client: $client } = getClient();
      const response = await $client.request<PublishFlow>(
        gql`
          mutation PublishFlow(
            $data: jsonb = {}
            $flow_id: uuid
            $publisher_id: Int
            $summary: String
          ) {
            publishedFlow: insert_published_flows_one(
              object: {
                data: $data
                flow_id: $flow_id
                publisher_id: $publisher_id
                summary: $summary
              }
            ) {
              id
              flowId: flow_id
              publisherId: publisher_id
              createdAt: created_at
              data
            }
          }
        `,
        {
          data: flattenedFlow,
          flow_id: req.params.flowId,
          publisher_id: parseInt(userId),
          summary: req.query?.summary || null,
        },
      );

      const publishedFlow =
        response.publishedFlow && response.publishedFlow.data;

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
        message: "No new changes to publish",
      });
    }
  } catch (error) {
    return next(error);
  }
};
