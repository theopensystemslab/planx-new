import { gql, useQuery } from "@apollo/client";
import { hasFeatureFlag } from "lib/featureFlags";
import { Notification } from "pages/FlowEditor/components/Notifications/types";

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
  }
`;

const GET_PANEL_NOTIFICATIONS = gql`
  ${NOTIFICATION_FIELDS}
  query GetPanelNotificationsForTeam($teamSlug: String!) {
    active: notifications(
      where: {
        team: { slug: { _eq: $teamSlug } }
        resolved_at: { _is_null: true }
      }
      order_by: { created_at: desc }
    ) {
      ...NotificationFields
    }
    resolved: notifications(
      where: {
        team: { slug: { _eq: $teamSlug } }
        resolved_at: { _is_null: false }
      }
      order_by: { created_at: desc }
      limit: 5
    ) {
      ...NotificationFields
    }
  }
`;

interface QueryResult {
  active: Notification[];
  resolved: Notification[];
}

export const useRecentNotifications = (
  teamSlug?: string,
): { active: Notification[]; resolved: Notification[] } => {
  const { data } = useQuery<QueryResult>(GET_PANEL_NOTIFICATIONS, {
    variables: { teamSlug },
    skip: !teamSlug || !hasFeatureFlag("NOTIFICATIONS"),
  });

  return {
    active: data?.active ?? [],
    resolved: data?.resolved ?? [],
  };
};
