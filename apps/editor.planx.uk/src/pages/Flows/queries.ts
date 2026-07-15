import { gql } from "@apollo/client";
import type { FlowSummary } from "pages/FlowEditor/lib/store/editor";

export const FLOW_SUMMARY_FIELDS = gql`
  fragment FlowSummaryFields on flows {
    id
    name
    slug
    status
    summary
    updatedAt: updated_at
    isListedOnLPS: is_listed_on_lps
    operations(limit: 1, order_by: { created_at: desc }) {
      createdAt: created_at
      actor {
        firstName: first_name
        lastName: last_name
      }
    }
    templatedFrom: templated_from
    isTemplate: is_template
    isService: is_service
    isPattern: is_pattern
    template {
      team {
        id
        name
      }
    }
    publishedFlows: published_flows(order_by: { created_at: desc }, limit: 1) {
      publishedAt: created_at
      hasSendComponent: has_send_component
      hasVisiblePayComponent: has_pay_component
      hasEnabledServiceCharge: service_charge_enabled
    }
    pinnedFlows: user_pinned_flows {
      flowId: flow_id
    }
  }
`;

export const GET_FLOWS = gql`
  ${FLOW_SUMMARY_FIELDS}
  query GetFlows($teamId: Int!) {
    flows(
      where: { team: { id: { _eq: $teamId } }, archived_at: { _is_null: true } }
    ) {
      ...FlowSummaryFields
    }
  }
`;

export const GET_ARCHIVED_FLOWS = gql`
  ${FLOW_SUMMARY_FIELDS}
  query GetArchivedFlows($teamId: Int!) {
    flows(
      where: {
        team: { id: { _eq: $teamId } }
        archived_at: { _is_null: false }
      }
    ) {
      ...FlowSummaryFields
    }
  }
`;

export type GetAnyFlowsQuery = {
  flows: FlowSummary[];
};

export type GetAnyFlowsVars = {
  teamId: number;
};

/**
 * Cascade to any notifications associated with this flow
 */
export const ARCHIVE_FLOW = gql`
  mutation ArchiveFlow($id: uuid!, $slug: String!) {
    flow: update_flows_by_pk(
      pk_columns: { id: $id }
      _set: { archived_at: "now()", status: offline, slug: $slug }
    ) {
      id
    }
    notifications: delete_notifications(where: { flow_id: { _eq: $id } }) {
      returning {
        id
      }
    }
  }
`;

export const UNARCHIVE_FLOW = gql`
  mutation UnarchiveFlow($id: uuid!, $slug: String!) {
    flow: update_flows_by_pk(
      pk_columns: { id: $id }
      _set: { archived_at: null, slug: $slug }
    ) {
      id
    }
  }
`;

export type FlowMutationResponse = {
  flow: {
    id: string;
  };
};

export type FlowNotificationCascadeMutationResponse = FlowMutationResponse & {
  notifications: {
    returning:
      | {
          id: number;
        }[]
      | [];
  };
};

export type FlowStatusMutationVars = {
  id: string;
  slug: string;
};

/**
 * Cascade to any notifications associated with this flow
 */
export const DELETE_FLOW = gql`
  mutation DeleteFlow($id: uuid!, $slug: String!) {
    flow: update_flows_by_pk(
      pk_columns: { id: $id }
      _set: { deleted_at: "now()", slug: $slug }
    ) {
      id
    }
    notifications: delete_notifications(where: { flow_id: { _eq: $id } }) {
      returning {
        id
      }
    }
  }
`;

export type RenameFlowMutationVars = {
  flowId: string;
  newSlug: string;
  newName: string;
};

export const RENAME_FLOW = gql`
  mutation RenameFlow($flowId: uuid!, $newSlug: String, $newName: String) {
    flow: update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { slug: $newSlug, name: $newName }
    ) {
      id
    }
  }
`;

export const RENAME_AND_UNARCHIVE_FLOW = gql`
  mutation RenameAndUnarchiveFlow(
    $flowId: uuid!
    $newSlug: String
    $newName: String
  ) {
    flow: update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { slug: $newSlug, name: $newName, archived_at: null }
    ) {
      id
    }
  }
`;
