import { gql, useQuery } from "@apollo/client";

export interface TeamDashboardStats {
  sessionsCurrent: number;
  sessionsPrevious: number;
  submissionsCurrent: number;
  submissionsPrevious: number;
  guidanceSessionsCurrent: number;
  guidanceSessionsPrevious: number;
  onlineFlows: number;
  onlineFlowsPrevious: number;
}

const GET_TEAM_DASHBOARD_STATS = gql`
  query GetTeamDashboardStats($teamSlug: String!) {
    teamDashboardStats: team_dashboard_stats(
      where: { team_slug: { _eq: $teamSlug } }
    ) {
      sessionsCurrent: sessions_current
      sessionsPrevious: sessions_previous
      submissionsCurrent: submissions_current
      submissionsPrevious: submissions_previous
      guidanceSessionsCurrent: guidance_sessions_current
      guidanceSessionsPrevious: guidance_sessions_previous
      onlineFlows: online_flows
      onlineFlowsPrevious: online_flows_previous
    }
  }
`;

export function useTeamDashboardStats(teamSlug: string) {
  return useQuery<{ teamDashboardStats: TeamDashboardStats[] }>(
    GET_TEAM_DASHBOARD_STATS,
    { variables: { teamSlug } },
  );
}
