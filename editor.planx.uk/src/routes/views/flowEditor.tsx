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

type Environment = keyof typeof DASHBOARD_PUBLIC_IDS;

const environment = process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

// The dashboard links across Metabase staging and production are different, so we need to store and be able to access both
const DASHBOARD_PUBLIC_IDS = {
  production: {
    discretionary: "34e5a17c-2f20-4543-be0b-4af8364dceee",
    FOIYNPP: "d55b0362-3a21-4153-a53d-c1d6a55ff5e2",
    RAB: "f3da39ec-bb4f-4ee0-8950-afcb5765d686",
    submission: "040dad13-6783-4e48-9edc-be1b03aa5247",
  },
  staging: {
    discretionary: "0c0abafd-e919-4da2-a5b3-1c637f703954",
    FOIYNPP: "d6303f0b-d6e8-4169-93c0-f988a93e19bc",
    RAB: "85c120bf-39b0-4396-bf8a-254b885e77f5",
    submission: "363fd552-8c2b-40d9-8b7a-21634ec182cc",
  },
} as const;

const FOIYNPP = {
  id: DASHBOARD_PUBLIC_IDS[environment].FOIYNPP,
  slugs: [
    "check-if-you-need-planning-permission",
    "find-out-if-you-need-planning-permission",
  ],
};
const RAB = {
  id: DASHBOARD_PUBLIC_IDS[environment].RAB,
  slugs: ["report-a-planning-breach"],
};
const submission = {
  id: DASHBOARD_PUBLIC_IDS[environment].submission,
  slugs: [
    "apply-for-planning-permission",
    "apply-for-a-lawful-development-certificate",
    "pre-application",
  ],
};

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
    flowAnalyticsLink = generateAnalyticsLink({
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

const includedServices = [FOIYNPP, RAB, submission];
// TODO: figure out how to handle discretionary services
// const discretionaryDashboardTemplate = 118

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
