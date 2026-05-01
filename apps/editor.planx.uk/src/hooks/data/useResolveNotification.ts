import { gql, useMutation } from "@apollo/client";

const RESOLVE_NOTIFICATION = gql`
  mutation ResolveNotification($id: Int!, $resolvedAt: timestamptz!) {
    update_notifications_by_pk(
      pk_columns: { id: $id }
      _set: { resolved_at: $resolvedAt }
    ) {
      id
      resolvedAt: resolved_at
    }
  }
`;

interface MutationResult {
  update_notifications_by_pk: { id: number; resolvedAt: string };
}

interface MutationVariables {
  id: number;
  resolvedAt: string;
}

export const useResolveNotification = () =>
  useMutation<MutationResult, MutationVariables>(RESOLVE_NOTIFICATION, {
    refetchQueries: [
      "GetPanelNotificationsForTeam",
      "GetUnresolvedNotificationsForTeam",
    ],
  });
