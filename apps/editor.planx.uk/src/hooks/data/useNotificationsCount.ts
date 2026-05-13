import { gql, useSubscription } from "@apollo/client";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";

const GET_UNRESOLVED_NOTIFICATIONS = gql`
  subscription GetUnresolvedNotificationsForTeam($teamId: Int!) {
    notifications(
      where: { team_id: { _eq: $teamId }, resolved_at: { _is_null: true } }
      distinct_on: flow_id
    ) {
      id
    }
  }
`;

interface QueryResult {
  notifications: { id: number }[];
}

export const useNotificationsCount = (): number => {
  const teamId = useStore((state) => state.teamId);

  const { data } = useSubscription<QueryResult>(GET_UNRESOLVED_NOTIFICATIONS, {
    variables: { teamId },
    skip: !teamId || !hasFeatureFlag("NOTIFICATIONS"),
  });

  return data?.notifications?.length ?? 0;
};
