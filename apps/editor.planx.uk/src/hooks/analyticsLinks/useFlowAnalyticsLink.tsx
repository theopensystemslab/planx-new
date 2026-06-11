import { gql, useQuery } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

const IS_PROD = import.meta.env.VITE_APP_ENV === "production";

const DASHBOARD_IDS = {
  foiynpp: "d55b0362-3a21-4153-a53d-c1d6a55ff5e2",
  rab: "f3da39ec-bb4f-4ee0-8950-afcb5765d686",
  discretionary: "34e5a17c-2f20-4543-be0b-4af8364dceee",
  submission: "040dad13-6783-4e48-9edc-be1b03aa5247",
} as const;

const DASHBOARD_SLUG_MAP: Record<string, string> = {
  // FOIYNPP
  "check-if-you-need-planning-permission": DASHBOARD_IDS.foiynpp,
  "find-out-if-you-need-planning-permission": DASHBOARD_IDS.foiynpp,
  "find-out-if-you-need-planning-permission-advice-service":
    DASHBOARD_IDS.foiynpp,

  // RAB
  "camden-report-a-planning-breach": DASHBOARD_IDS.rab,
  "report-a-planning-breach": DASHBOARD_IDS.rab,

  // Discretionary
  "check-constraints-on-a-property": DASHBOARD_IDS.discretionary,
  "check-whether-you-need-a-building-control-application":
    DASHBOARD_IDS.discretionary,
  "check-your-planning-constraints": DASHBOARD_IDS.discretionary,
  "general-enquiries": DASHBOARD_IDS.discretionary,
  "heritage-constraints": DASHBOARD_IDS.discretionary,
  "notify-us-of-any-high-efficiency-alternative-energy-systems":
    DASHBOARD_IDS.discretionary,
  "report-a-potential-dangerous-structure": DASHBOARD_IDS.discretionary,
  "request-a-building-control-quote": DASHBOARD_IDS.discretionary,
  "validation-requirements-live": DASHBOARD_IDS.discretionary,
};

export const getAnalyticsDashboardId = ({
  flowSlug,
  isSubmissionService,
}: {
  flowSlug: string;
  isSubmissionService: boolean;
}): string | undefined => {
  const dashboardId = DASHBOARD_SLUG_MAP[flowSlug];
  if (dashboardId) return dashboardId;

  // Fallback to check general submission services
  if (isSubmissionService) return DASHBOARD_IDS.submission;

  return undefined;
};

export const generateFlowAnalyticsLink = ({
  flowId,
  dashboardId,
}: {
  flowId: string;
  dashboardId: string;
}): string => {
  const url = new URL(
    `https://metabase.editor.planx.uk/public/dashboard/${dashboardId}`,
  );
  url.searchParams.set("flow_id", flowId);
  return url.toString();
};

// This query should not result in a network request - we should get a cache hit for GetFlow
const GET_FLOW_ANALYTICS = gql`
  query GetFlowAnalytics($flowSlug: String!, $teamSlug: String!) {
    flows(
      limit: 1
      where: { slug: { _eq: $flowSlug }, team: { slug: { _eq: $teamSlug } } }
    ) {
      id
      publishedFlows: published_flows(
        limit: 1
        order_by: { created_at: desc }
      ) {
        hasSendComponent: has_send_component
      }
      onlineHistory: flow_status_histories(
        where: { status: { _eq: online } }
        limit: 1
      ) {
        status
      }
    }
  }
`;

interface GetFlowAnalyticsResponse {
  flows: {
    id: string;
    publishedFlows: { hasSendComponent: boolean }[];
    onlineHistory: { status: string }[];
  }[];
}

/**
 * Returns the Metabase analytics link for the current flow
 */
export const useFlowAnalyticsLink = (): string | undefined => {
  const [teamSlug, flowSlug] = useStore((state) => [
    state.teamSlug,
    state.flowSlug,
  ]);

  const { data } = useQuery<GetFlowAnalyticsResponse>(GET_FLOW_ANALYTICS, {
    variables: { teamSlug, flowSlug },
    skip: !teamSlug || !flowSlug || !IS_PROD,
  });

  // Metabase dashboards per-flow only exist on production
  if (!IS_PROD) return;

  const flow = data?.flows[0];
  if (!flow) return;

  const hasAnalytics = Boolean(flow.onlineHistory.length);
  if (!hasAnalytics) return;

  const isSubmissionService = Boolean(flow.publishedFlows[0]?.hasSendComponent);
  const dashboardId = getAnalyticsDashboardId({
    flowSlug,
    isSubmissionService,
  });
  if (!dashboardId) return;

  return generateFlowAnalyticsLink({ flowId: flow.id, dashboardId });
};
