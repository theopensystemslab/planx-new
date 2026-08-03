import { gql, useQuery } from "@apollo/client";

export interface PlatformDashboardStats {
  lpasCurrent: number;
  lpasPrevious: number;
  onlineFlowsCurrent: number;
  onlineFlowsPrevious: number;
  sessionsCurrent: number;
  sessionsPrevious: number;
  submissionsCurrent: number;
  submissionsPrevious: number;
}

const GET_PLATFORM_DASHBOARD_STATS = gql`
  query GetPlatformDashboardStats {
    platformDashboardStats: platform_dashboard_stats {
      lpasCurrent: lpas_current
      lpasPrevious: lpas_previous
      onlineFlowsCurrent: online_flows_current
      onlineFlowsPrevious: online_flows_previous
      sessionsCurrent: sessions_current
      sessionsPrevious: sessions_previous
      submissionsCurrent: submissions_current
      submissionsPrevious: submissions_previous
    }
  }
`;

export function useExploreStats() {
  return useQuery<{ platformDashboardStats: PlatformDashboardStats[] }>(
    GET_PLATFORM_DASHBOARD_STATS,
  );
}
