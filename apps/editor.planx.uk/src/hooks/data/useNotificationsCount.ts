import { gql, useQuery } from "@apollo/client";
import { hasFeatureFlag } from "lib/featureFlags";

const GET_UNRESOLVED_NOTIFICATIONS = gql`
  query GetUnresolvedNotificationsForTeam($teamSlug: String!) {
    notifications(
      where: {
        team: { slug: { _eq: $teamSlug } }
        resolved_at: { _is_null: true }
      }
      distinct_on: flow_id
    ) {
      id
    }
  }
`;

interface QueryResult {
  notifications: { id: number }[];
}

export const useNotificationsCount = (teamSlug?: string): number => {
  const { data } = useQuery<QueryResult>(GET_UNRESOLVED_NOTIFICATIONS, {
    variables: { teamSlug },
    skip: !teamSlug || !hasFeatureFlag("NOTIFICATIONS"),
  });

  return data?.notifications?.length ?? 0;
};
