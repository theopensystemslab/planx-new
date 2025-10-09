import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import { notFound } from "@tanstack/react-router";

import { client } from "../../../../lib/graphql";

export interface FlowEditorData {
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

export interface GetFlowEditorDataResponse {
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

export interface BasicFlowData {
  id: string;
  name: string;
}

export interface BasicFlowResponse {
  flows: BasicFlowData[];
}

/**
 * Fetch comprehensive flow editor metadata including template info, publish status, etc.
 */
export const getFlowEditorData = async (
  flowSlug: string,
  teamSlug: string,
): Promise<FlowEditorData> => {
  const { data } = await client.query<GetFlowEditorDataResponse>({
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
      team_slug: teamSlug,
    },
  });

  const flow = data.flows[0];
  if (!flow) {
    throw notFound();
  }

  return {
    id: flow.id,
    flowStatus: flow.status,
    flowAnalyticsLink: flow.flowAnalyticsLink,
    templatedFrom: flow.templatedFrom,
    isTemplate: flow.isTemplate,
    isFlowPublished: flow.publishedFlowsAggregate?.aggregate.count > 0,
    template: flow.template || undefined,
  };
};

/**
 * Fetch basic flow information (id, name) for initial setup
 */
export const getBasicFlowData = async (
  flowSlug: string,
  teamSlug: string,
): Promise<BasicFlowData> => {
  const { data } = await client.query<BasicFlowResponse>({
    query: gql`
      query GetFlow($flowSlug: String!, $teamSlug: String!) {
        flows(
          limit: 1
          where: {
            slug: { _eq: $flowSlug }
            team: { slug: { _eq: $teamSlug } }
          }
        ) {
          id
          name
        }
      }
    `,
    variables: {
      flowSlug,
      teamSlug,
    },
  });

  const flow = data.flows[0];
  if (!flow) {
    throw notFound();
  }

  return flow;
};
