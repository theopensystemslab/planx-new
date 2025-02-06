import { gql } from "@apollo/client";
import { client } from "lib/graphql";
import { useStore } from "pages/FlowEditor/lib/store";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";

import { getUniqueFlow } from "../utils";

export const renameFlow = (
  flow: FlowSummary,
  flows: FlowSummary[],
  refreshFlows: () => void,
) => {
  const { teamId } = useStore.getState();

  return {
    onClick: async () => {
      const newName = prompt("New name", flow.name);
      if (newName && newName !== flow.name) {
        const uniqueFlow = getUniqueFlow(newName, flows);
        if (uniqueFlow) {
          await client.mutate({
            mutation: gql`
              mutation UpdateFlowSlug(
                $teamId: Int
                $slug: String
                $newSlug: String
                $newName: String
              ) {
                update_flows(
                  where: {
                    team: { id: { _eq: $teamId } }
                    slug: { _eq: $slug }
                  }
                  _set: { slug: $newSlug, name: $newName }
                ) {
                  affected_rows
                }
              }
            `,
            variables: {
              teamId: teamId,
              slug: flow.slug,
              newSlug: uniqueFlow.slug,
              newName: uniqueFlow.name,
            },
          });

          refreshFlows();
        }
      }
    },
    label: "Rename",
  };
};
