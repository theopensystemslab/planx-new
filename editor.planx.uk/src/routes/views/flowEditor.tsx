import { gql } from "@apollo/client";
import { NaviRequest, NotFoundError } from "navi";
import FlowEditorLayout from "pages/layout/FlowEditorLayout";
import React from "react";
import { View } from "react-navi";

import { client } from "../../lib/graphql";
import { useStore } from "../../pages/FlowEditor/lib/store";

interface FlowMetadata {
  flowAnalyticsLink: string;
  isFlowPublished: boolean;
}

interface GetFlowMetadata {
  flows: {
    flowAnalyticsLink: string;
    publishedFlowsAggregate: {
      aggregate: {
        count: number;
      };
    };
  }[];
}

const getFlowMetadata = async (
  flowSlug: string,
  team: string,
): Promise<FlowMetadata> => {
  const {
    data: { flows },
  } = await client.query<GetFlowMetadata>({
    query: gql`
      query GetFlowMetadata($slug: String!, $team_slug: String!) {
        flows(
          limit: 1
          where: { slug: { _eq: $slug }, team: { slug: { _eq: $team_slug } } }
        ) {
          id
          flowAnalyticsLink: analytics_link
          publishedFlowsAggregate: published_flows_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `,
    variables: {
      slug: flowSlug,
      team_slug: team,
    },
  });

  const flow = flows[0];
  if (!flows) throw new NotFoundError(`Flow ${flowSlug} not found for ${team}`);

  const metadata = {
    flowAnalyticsLink: flow.flowAnalyticsLink,
    isFlowPublished: flow.publishedFlowsAggregate?.aggregate.count > 0,
  };
  return metadata;
};

/**
 * View wrapper for all flowEditor routes
 */
export const flowEditorView = async (req: NaviRequest) => {
  const [flow] = req.params.flow.split(",");
  const { flowAnalyticsLink, isFlowPublished } = await getFlowMetadata(
    flow,
    req.params.team,
  );
  useStore.setState({ flowAnalyticsLink, isFlowPublished });

  return (
    <FlowEditorLayout>
      <View />
    </FlowEditorLayout>
  );
};
