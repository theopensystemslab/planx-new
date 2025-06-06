import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import { NaviRequest, NotFoundError } from "navi";
import FlowEditorLayout from "pages/layout/FlowEditorLayout";
import React from "react";
import { View } from "react-navi";

import { client } from "../../lib/graphql";
import {
  Environment,
  getFOIYNPP,
  getRAB,
  getSubmission,
} from "../../pages/FlowEditor/lib/analytics/utils";
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

const environment: Environment =
  import.meta.env.VITE_APP_ENV === "production" ? "production" : "staging";

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

  let flowAnalyticsLink: string | null = null;

  if (flowStatus === "online") {
    flowAnalyticsLink =
      generateAnalyticsLink({
        environment,
        flowId: id,
        flowSlug: flow,
      }) ?? null;
  }

  useStore.setState({
    id,
    flowStatus,
    flowAnalyticsLink,
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

const includedServices = [
  getFOIYNPP(environment),
  getRAB(environment),
  getSubmission(environment),
];
// TODO: figure out how to handle discretionary services

export const generateAnalyticsLink = ({
  environment,
  flowId,
  flowSlug,
}: {
  environment: Environment;
  flowId: string;
  flowSlug: string;
}): string | undefined => {
  let dashboardId: string | undefined;

  for (const service of includedServices) {
    const found = service.slugs.some((slug) => flowSlug.includes(slug));
    if (found) {
      dashboardId = service.id;
      break;
    }
  }

  if (!dashboardId) {
    return;
  }

  const baseDomain = environment === "production" ? "uk" : "dev";
  const host = `https://metabase.editor.planx.${baseDomain}`;
  const pathname = `/public/dashboard/${dashboardId}`;
  const url = new URL(pathname, host);
  const search = new URLSearchParams({
    flow_id: flowId,
  }).toString();
  url.search = search;

  return url.toString();
};
