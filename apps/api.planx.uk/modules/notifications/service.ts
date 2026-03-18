import { gql } from "graphql-request";
import { $api } from "../../client/index.js";

interface UpdateNotifications {
  notifications: {
    returning:
      | {
          id: number;
        }[]
      | [];
  };
}

// Currently only initiated via a Hasura event, so we don't have user context here and rely on $api client
export const resolveNotification = async (flowId: string, type: string) => {
  // If many unresolved notifications of the same "type" exist for this flow, resolve them all
  //   If no notifications match these conditions, it'll simply return [] and still "succeed"
  const resolveNotificationResponse =
    await $api.client.request<UpdateNotifications>(
      gql`
        mutation UpdateNotifications(
          $flowId: uuid!
          $type: notification_type_enum_enum!
          $resolvedAt: timestamp!
        ) {
          notifications: update_notifications_many(
            updates: {
              where: {
                flow_id: { _eq: $flowId }
                type: { _eq: $type }
                resolved_at: { _is_null: true }
              }
              _set: { resolved_at: $resolvedAt }
            }
          ) {
            returning {
              id
            }
          }
        }
      `,
      {
        flowId: flowId,
        type: type,
        resolvedAt: new Date(),
      },
    );

  return resolveNotificationResponse.notifications.returning;
};
