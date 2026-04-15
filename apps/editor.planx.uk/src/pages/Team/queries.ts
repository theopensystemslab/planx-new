import { gql } from "@apollo/client";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";

export const GET_ARCHIVED_FLOWS = gql`
  query GetArchivedFlows($teamId: Int!) {
    flows(
      where: {
        team: { id: { _eq: $teamId } }
        archived_at: { _is_null: false }
      }
    ) {
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
      template {
        team {
          id
          name
        }
      }
      publishedFlows: published_flows(
        order_by: { created_at: desc }
        limit: 1
      ) {
        publishedAt: created_at
        hasSendComponent: has_send_component
        hasVisiblePayComponent: has_pay_component
        hasEnabledServiceCharge: service_charge_enabled
      }
    }
  }
`;

export type GetArchivedFlowsQuery = {
  flows: FlowSummary[];
};

export type GetArchivedFlowsVars = {
  teamId: number;
};

export const ARCHIVE_FLOW = gql`
  mutation ArchiveFlow($id: uuid!, $slug: String!) {
    flow: update_flows_by_pk(pk_columns: {id: $id}, _set: {archived_at: "now()", status: offline, slug: $slug}) {
      id
      name
    }
  }
`

export const UNARCHIVE_FLOW = gql`
  mutation UnarchiveFlow($id: uuid!, $slug: String!) {
    flow: update_flows_by_pk(pk_columns: {id: $id}, _set: {archived_at: null, slug: $slug}) {
      id
    }
  }
`

export type FlowStatusMutation = {
  flow: {
    id: string;
  }
}

export type FlowStatusMutationVars = {
  id: string; 
  slug: string;
}