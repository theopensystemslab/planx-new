import { gql, useSubscription } from "@apollo/client";
import { hasFeatureFlag } from "lib/featureFlags";
import { Notification } from "pages/FlowEditor/components/Notifications/types";
import { useStore } from "pages/FlowEditor/lib/store";

const NOTIFICATION_FIELDS = gql`
  fragment NotificationFields on notifications {
    id
    flow {
      id
      name
      slug
    }
    team {
      id
      name
      slug
    }
    type
    createdAt: created_at
    resolvedAt: resolved_at
    resolvedByUser: user {
      firstName: first_name
      lastName: last_name
    }
  }
`;

const GET_ACTIVE_NOTIFICATIONS = gql`
  ${NOTIFICATION_FIELDS}
  subscription GetActiveNotificationsForTeam($teamId: Int!) {
    active: notifications(
      where: { team_id: { _eq: $teamId }, resolved_at: { _is_null: true } }
      order_by: { created_at: desc }
    ) {
      ...NotificationFields
    }
  }
`;

const GET_RESOLVED_NOTIFICATIONS = gql`
  ${NOTIFICATION_FIELDS}
  subscription GetResolvedNotificationsForTeam($teamId: Int!) {
    resolved: notifications(
      where: { team_id: { _eq: $teamId }, resolved_at: { _is_null: false } }
      order_by: { created_at: desc }
      limit: 5
    ) {
      ...NotificationFields
    }
  }
`;

export const useRecentNotifications = (): {
  active: Notification[];
  resolved: Notification[];
} => {
  const teamId = useStore((state) => state.teamId);
  const skip = !teamId || !hasFeatureFlag("NOTIFICATIONS");

  const { data: activeData } = useSubscription<{ active: Notification[] }>(
    GET_ACTIVE_NOTIFICATIONS,
    { variables: { teamId }, skip },
  );

  const { data: resolvedData } = useSubscription<{ resolved: Notification[] }>(
    GET_RESOLVED_NOTIFICATIONS,
    { variables: { teamId }, skip },
  );

  return {
    active: activeData?.active ?? [],
    resolved: resolvedData?.resolved ?? [],
  };
};
