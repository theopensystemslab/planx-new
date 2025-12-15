import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import { NaviRequest, NotFoundError } from "navi";
import FlowEditorLayout from "pages/layout/FlowEditorLayout";
import React from "react";
import { View } from "react-navi";

import { client } from "../../lib/graphql";
import { useStore } from "../../pages/FlowEditor/lib/store";

interface FlowEditorData {
  id: string;
  flowStatus: FlowStatus;
  flowAnalyticsLink: string;
  templatedFrom: string;
  isTemplate: boolean;
  isFlowPublished: boolean;
  template?: {
    id: string;
    team: {
      name: string;
    };
    publishedFlows: {
      publishedAt: string;
      summary: string;
    }[];
  };
}

interface GetFlowEditorData {
  flows: {
    id: string;
    status: FlowStatus;
    flowAnalyticsLink: string;
    templatedFrom: string;
    isTemplate: boolean;
    publishedFlowsAggregate: {
      aggregate: {
        count: number;
      };
    };
    template: {
      id: string;
      team: {
        name: string;
      };
      publishedFlows: {
        publishedAt: string;
        summary: string;
      }[];
    } | null;
  }[];
}

export const getFlowEditorData = async (
  flowSlug: string,
  team: string,
): Promise<FlowEditorData> => {
  const {
    data: { flows },
  } = await client.query<GetFlowEditorData>({
    query: gql`
      query GetFlowMetadata($slug: String!, $team_slug: String!) {
        flows(
          limit: 1
          where: { slug: { _eq: $slug }, team: { slug: { _eq: $team_slug } } }
        ) {
          id
          status
          templatedFrom: templated_from
          isTemplate: is_template
          publishedFlowsAggregate: published_flows_aggregate {
            aggregate {
              count
            }
          }
          template {
            id
            team {
              name
            }
            publishedFlows: published_flows(
              order_by: { created_at: desc }
              limit: 1
            ) {
              publishedAt: created_at
              summary
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

  const flowEditorData: FlowEditorData = {
    id: flow.id,
    flowStatus: flow.status,
    flowAnalyticsLink: flow.flowAnalyticsLink,
    templatedFrom: flow.templatedFrom,
    isTemplate: flow.isTemplate,
    isFlowPublished: flow.publishedFlowsAggregate?.aggregate.count > 0,
    template: flow.template ? flow.template : undefined,
  };

  return flowEditorData;
};

/**
 * View wrapper for all flowEditor routes
 */
export const flowEditorView = async (req: NaviRequest) => {
  const [flow] = req.params.flow.split(",");

  const {
    id,
    flowStatus,
    isFlowPublished,
    isTemplate,
    templatedFrom,
    template,
  } = await getFlowEditorData(flow, req.params.team);

  useStore.setState({
    id,
    flowStatus,
    isFlowPublished,
    isTemplate,
    isTemplatedFrom: Boolean(templatedFrom),
    template,
  });

  return (
    <FlowEditorLayout>
      <View />
    </FlowEditorLayout>
  );
};
