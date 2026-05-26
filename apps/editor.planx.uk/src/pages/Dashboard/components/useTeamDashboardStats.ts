import { gql, useQuery } from "@apollo/client";

export interface TeamDashboardStats {
  sessions_current: number;
  sessions_previous: number;
  submissions_current: number;
  submissions_previous: number;
  guidance_sessions_current: number;
  guidance_sessions_previous: number;
  online_flows: number;
  online_flows_previous: number;
}

const GET_TEAM_DASHBOARD_STATS = gql`
  query GetTeamDashboardStats($teamSlug: String!) {
    team_dashboard_stats(where: { team_slug: { _eq: $teamSlug } }) {
      sessions_current
      sessions_previous
      submissions_current
      submissions_previous
      guidance_sessions_current
      guidance_sessions_previous
      online_flows
      online_flows_previous
    }
  }
`;

export function useTeamDashboardStats(teamSlug: string) {
  return useQuery<{ team_dashboard_stats: TeamDashboardStats[] }>(
    GET_TEAM_DASHBOARD_STATS,
    { variables: { teamSlug } },
  );
}
