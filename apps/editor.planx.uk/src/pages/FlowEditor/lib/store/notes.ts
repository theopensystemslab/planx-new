import { gql } from "@apollo/client";
import type { Graph } from "@planx/graph";
import type { NotePlacement } from "hooks/data/useFlowNotes";
import { client } from "lib/graphql";
import { repositionPlacementAfterDeletion } from "pages/FlowEditor/components/Flow/notes/lib/notePlacement";
import type { StateCreator } from "zustand";

import type { AuthStore } from "./auth";
import type { SharedStore } from "./shared";

interface FlowNoteRowForReposition {
  id: string;
  node_id: string | null;
  placement: NotePlacement | null;
  created_by: number;
}

const GET_FLOW_NOTES_FOR_REPOSITION = gql`
  query GetFlowNotesForReposition($flowId: uuid!) {
    flow_notes(where: { flow_id: { _eq: $flowId } }) {
      id
      node_id
      placement
      created_by
    }
  }
`;

const DELETE_FLOW_NOTES = gql`
  mutation DeleteFlowNotes($ids: [uuid!]!) {
    delete_flow_notes(where: { id: { _in: $ids } }) {
      affected_rows
    }
  }
`;

const REANCHOR_FLOW_NOTE = gql`
  mutation ReanchorFlowNote($id: uuid!, $placement: jsonb!) {
    update_flow_notes_by_pk(
      pk_columns: { id: $id }
      _set: { placement: $placement }
    ) {
      id
    }
  }
`;

export interface NotesStore {
  /**
   * Called after a node is removed from the flow, with the flow as it was immediately before and immediately after.
   */
  repositionNotesForDeletedNodes: (
    deletedNodeIds: string[],
    flowBeforeDelete: Graph,
    flowAfterDelete: Graph,
  ) => Promise<void>;

  /**
   * Called after a node is moved to a new parent
   */
  repositionNotesForMovedNode: (
    movedId: string,
    oldParent: string,
    newFirstChildOfOldParent: string | undefined,
  ) => Promise<void>;
}

export const notesStore: StateCreator<
  SharedStore & AuthStore & NotesStore,
  [],
  [],
  NotesStore
> = (_set, get) => ({
  repositionNotesForDeletedNodes: async (
    deletedNodeIds,
    flowBeforeDelete,
    flowAfterDelete,
  ) => {
    const flowId = get().id;
    const userId = get().user?.id;
    if (!flowId || !userId || deletedNodeIds.length === 0) return;

    const deleted = new Set(deletedNodeIds);

    const { data } = await client.query<{
      flow_notes: FlowNoteRowForReposition[];
    }>({
      query: GET_FLOW_NOTES_FOR_REPOSITION,
      variables: { flowId },
      fetchPolicy: "network-only",
    });

    const toDelete: string[] = [];
    const toReanchor: Array<{ id: string; placement: NotePlacement }> = [];

    for (const note of data.flow_notes) {
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
              mutation: DELETE_FLOW_NOTES,
              variables: { ids: toDelete },
            }),
          ]
        : []),
      ...toReanchor.map(({ id, placement }) =>
        client.mutate({
          mutation: REANCHOR_FLOW_NOTE,
          variables: { id, placement },
        }),
      ),
    ]);
  },

  repositionNotesForMovedNode: async (
    movedId,
    oldParent,
    newFirstChildOfOldParent,
  ) => {
    const flowId = get().id;
    const userId = get().user?.id;
    if (!flowId || !userId) return;

    const { data } = await client.query<{
      flow_notes: FlowNoteRowForReposition[];
    }>({
      query: GET_FLOW_NOTES_FOR_REPOSITION,
      variables: { flowId },
      fetchPolicy: "network-only",
    });

    const notesToReposition = (data?.flow_notes ?? []).filter(
      (note) =>
        note.created_by === userId &&
        note.placement?.parent === oldParent &&
        note.placement?.before === movedId,
    );

    await Promise.all(
      notesToReposition.map((note) =>
        client.mutate({
          mutation: REANCHOR_FLOW_NOTE,
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
  },
});
