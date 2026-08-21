import { gql } from "@apollo/client";
import type { Graph } from "@planx/graph";
import type { NotePlacement } from "hooks/data/useFlowNotes";
import { client } from "lib/graphql";
import { useStore } from "pages/FlowEditor/lib/store";

import { repositionPlacementAfterDeletion } from "./notePlacement";

interface FlowNotePositionRowForReposition {
  id: string;
  node_id: string | null;
  placement: NotePlacement | null;
  created_by: number;
  updated_by: number;
}

const GET_FLOW_NOTE_POSITIONS_FOR_REPOSITION = gql`
  query GetFlowNotePositionsForReposition($flowId: uuid!) {
    flow_note_positions(
      where: { flow_id: { _eq: $flowId }, deleted_at: { _is_null: true } }
    ) {
      id
      node_id
      placement
      created_by
      updated_by
    }
  }
`;

// TODO update to soft delete
const DELETE_FLOW_NOTE_POSITIONS = gql`
  mutation DeleteFlowNotePositions($ids: [uuid!]!) {
    delete_flow_note_positions(where: { id: { _in: $ids } }) {
      affected_rows
    }
  }
`;

// TODO update to set `updated_by`
const REANCHOR_FLOW_NOTE_POSITION = gql`
  mutation ReanchorFlowNotePosition($id: uuid!, $placement: jsonb!) {
    update_flow_note_positions_by_pk(
      pk_columns: { id: $id }
      _set: { placement: $placement }
    ) {
      id
    }
  }
`;

/**
 * Called after a node is removed from the flow, with the flow as it was immediately before and immediately after.
 */
export const repositionNotesForDeletedNodes = async (
  deletedNodeIds: string[],
  flowBeforeDelete: Graph,
  flowAfterDelete: Graph,
): Promise<void> => {
  const flowId = useStore.getState().id;
  const userId = useStore.getState().user?.id;
  if (!flowId || !userId || deletedNodeIds.length === 0) return;

  const deleted = new Set(deletedNodeIds);

  const { data } = await client.query<{
    flow_note_positions: FlowNotePositionRowForReposition[];
  }>({
    query: GET_FLOW_NOTE_POSITIONS_FOR_REPOSITION,
    variables: { flowId },
    fetchPolicy: "network-only",
  });

  const toDelete: string[] = [];
  const toReanchor: Array<{ id: string; placement: NotePlacement }> = [];

  for (const note of data.flow_note_positions) {
    if (note.node_id) {
      if (deleted.has(note.node_id)) toDelete.push(note.id);
      continue;
    }

    if (!note.placement) continue;

    // Leading-position note whose `before` target was removed, but whose
    // container survives - re-anchor to the container's new first child
    if (note.placement.before && deleted.has(note.placement.before)) {
      toReanchor.push({
        id: note.id,
        placement: {
          parent: note.placement.parent,
          before: flowAfterDelete[note.placement.parent]?.edges?.[0],
          parentIsContainer: true,
        },
      });
      continue;
    }

    if (deleted.has(note.placement.parent)) {
      const repositioned = repositionPlacementAfterDeletion(
        flowBeforeDelete,
        flowAfterDelete,
        note.placement.parent,
        deleted,
      );
      if (repositioned) {
        toReanchor.push({ id: note.id, placement: repositioned });
      } else {
        toDelete.push(note.id);
      }
    }
  }

  await Promise.all([
    ...(toDelete.length > 0
      ? [
          client.mutate({
            mutation: DELETE_FLOW_NOTE_POSITIONS,
            variables: { ids: toDelete },
          }),
        ]
      : []),
    ...toReanchor.map(({ id, placement }) =>
      client.mutate({
        mutation: REANCHOR_FLOW_NOTE_POSITION,
        variables: { id, placement },
      }),
    ),
  ]);
};

/**
 * Called after a node is moved to a new parent
 */
export const repositionNotesForMovedNode = async (
  movedId: string,
  oldParent: string,
  newFirstChildOfOldParent: string | undefined,
): Promise<void> => {
  const flowId = useStore.getState().id;
  const userId = useStore.getState().user?.id;
  if (!flowId || !userId) return;

  const { data } = await client.query<{
    flow_note_positions: FlowNotePositionRowForReposition[];
  }>({
    query: GET_FLOW_NOTE_POSITIONS_FOR_REPOSITION,
    variables: { flowId },
    fetchPolicy: "network-only",
  });

  const notesToReposition = (data?.flow_note_positions ?? []).filter(
    (note) =>
      note.created_by === userId &&
      note.placement?.parent === oldParent &&
      note.placement?.before === movedId,
  );

  await Promise.all(
    notesToReposition.map((note) =>
      client.mutate({
        mutation: REANCHOR_FLOW_NOTE_POSITION,
        variables: {
          id: note.id,
          placement: {
            parent: oldParent,
            before: newFirstChildOfOldParent,
            parentIsContainer: true,
          },
        },
      }),
    ),
  );
};
