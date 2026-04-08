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
    }
  }
`;

export type GetArchivedFlowsQuery = FlowSummary[]
export type GetArchivedFlowsVars = {
  teamId: number;
}
