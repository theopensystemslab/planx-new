import { gql } from "@apollo/client";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";

import { FLOW_SUMMARY_FIELDS } from "./components/FlowCard/queries"

export const GET_FLOWS = gql`  
  ${FLOW_SUMMARY_FIELDS}
  query GetFlows($teamId: Int!) {
    flows(where: { team: { id: { _eq: $teamId } }, archived_at: { _is_null: true } }) {
      ...FlowSummaryFields
    }
  }
`

export const GET_ARCHIVED_FLOWS = gql`
  ${FLOW_SUMMARY_FIELDS}
  query GetArchivedFlows($teamId: Int!) {
    flows(where: { team: { id: { _eq: $teamId } }, archived_at: { _is_null: false } }) {
      ...FlowSummaryFields
    }
  }
`;

export type GetAnyFlowsQuery = {
  flows: FlowSummary[];
};

export type GetAnyFlowsVars = {
  teamId: number;
  userId: number
};

export const ARCHIVE_FLOW = gql`
  mutation ArchiveFlow($id: uuid!, $slug: String!) {
    flow: update_flows_by_pk(pk_columns: {id: $id}, _set: {archived_at: "now()", status: offline, slug: $slug}) {
      id
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