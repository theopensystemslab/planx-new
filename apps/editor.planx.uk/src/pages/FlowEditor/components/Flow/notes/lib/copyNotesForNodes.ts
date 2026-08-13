import { gql } from "@apollo/client";
import { client } from "lib/graphql";
import { useStore } from "pages/FlowEditor/lib/store";

import { CREATE_FLOW_NOTE_POSITION } from "../hooks/mutations";

export interface CopiedAttachedNote {
  nodeId: string;
  text: string;
}

interface AttachedFlowNoteRow {
  node_id: string;
  note: {
    text: string;
  };
}

const GET_ATTACHED_FLOW_NOTES_FOR_NODES = gql`
  query GetAttachedFlowNotesForNodes($flowId: uuid!, $nodeIds: [String!]!) {
    flow_note_positions(
      where: { flow_id: { _eq: $flowId }, node_id: { _in: $nodeIds } }
    ) {
      node_id
      note {
        text
      }
    }
  }
`;

/**
 * Fetch the notes attached to any of the given node ids, so they can be stashed on the clipboard alongside a copied node
 */
export const fetchAttachedFlowNotesForNodes = async (
  flowId: string,
  nodeIds: string[],
): Promise<CopiedAttachedNote[]> => {
  if (!flowId || nodeIds.length === 0) return [];

  const { data } = await client.query<{
    flow_note_positions: AttachedFlowNoteRow[];
  }>({
    query: GET_ATTACHED_FLOW_NOTES_FOR_NODES,
    variables: { flowId, nodeIds },
    fetchPolicy: "network-only",
  });

  return data.flow_note_positions.map((row) => ({
    nodeId: row.node_id,
    text: row.note.text,
  }));
};

/**
 * Re-attach copied notes to the newly pasted nodes they were originally attached to as an independent copy
 * editing the pasted note doesn't affect the original
 */
export const pasteAttachedFlowNotes = async (
  notes: CopiedAttachedNote[],
  idMap: Map<string, string>,
  flowId: string,
): Promise<void> => {
  const userId = useStore.getState().user?.id;
  if (!flowId || !userId || notes.length === 0) return;

  await Promise.all(
    notes.map(({ nodeId, text }) => {
      const newNodeId = idMap.get(nodeId);
      if (!newNodeId) return undefined;

      return client.mutate({
        mutation: CREATE_FLOW_NOTE_POSITION,
        variables: {
          object: {
            flow_id: flowId,
            node_id: newNodeId,
            created_by: userId,
            note: {
              data: {
                text,
                created_by: userId,
                updated_by: userId,
              },
            },
          },
        },
      });
    }),
  );
};
