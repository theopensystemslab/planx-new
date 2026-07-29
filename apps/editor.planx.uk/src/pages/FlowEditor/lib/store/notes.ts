import { gql } from "@apollo/client";
import type { Graph } from "@planx/graph";
import type { NotePlacement } from "hooks/data/useFlowNotes";
import { client } from "lib/graphql";
import { repositionPlacementAfterDeletion } from "pages/FlowEditor/components/Flow/notes/lib/notePlacement";
import type { StateCreator } from "zustand";

import type { AuthStore } from "./auth";
import type { SharedStore } from "./shared";

interface FlowNotePositionRowForReposition {
  id: string;
  node_id: string | null;
  placement: NotePlacement | null;
  created_by: number;
}

const GET_FLOW_NOTE_POSITIONS_FOR_REPOSITION = gql`
  query GetFlowNotePositionsForReposition($flowId: uuid!) {
    flow_note_positions(where: { flow_id: { _eq: $flowId } }) {
      id
      node_id
      placement
      created_by
    }
  }
`;

const CREATE_FLOW_NOTE_POSITION = gql`
  mutation CreateFlowNotePosition($object: flow_note_positions_insert_input!) {
    insert_flow_note_positions_one(object: $object) {
      id
    }
  }
`;

const GET_FLOW_NOTE_CONTENT = gql`
  query GetFlowNoteContent($id: uuid!) {
    flow_note_content_by_pk(id: $id) {
      text
      color
    }
  }
`;

const UPDATE_FLOW_NOTE_CONTENT = gql`
  mutation UpdateFlowNoteContent(
    $id: uuid!
    $set: flow_note_content_set_input!
  ) {
    update_flow_note_content_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

const DELETE_FLOW_NOTE_POSITION = gql`
  mutation DeleteFlowNotePosition($id: uuid!) {
    delete_flow_note_positions_by_pk(id: $id) {
      id
    }
  }
`;

const DELETE_FLOW_NOTE_POSITIONS = gql`
  mutation DeleteFlowNotePositions($ids: [uuid!]!) {
    delete_flow_note_positions(where: { id: { _in: $ids } }) {
      affected_rows
    }
  }
`;

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

export interface CreateFlowNoteInput {
  nodeId?: string;
  placement?: NotePlacement;
  text: string;
}

export interface PasteFlowNoteTarget {
  nodeId?: string;
  placement?: NotePlacement;
}

export interface NotesStore {
  createFlowNote: (input: CreateFlowNoteInput) => Promise<string | undefined>;
  updateFlowNote: (
    noteContentId: string,
    patch: { text?: string },
  ) => Promise<void>;
  deleteFlowNote: (positionId: string) => Promise<void>;

  /**
   * Cloning a note means clones will be linked to the original note, so editing one will affect the other.
   */
  cloneFlowNote: (noteContentId: string) => void;
  getClonedFlowNoteId: () => string | null;
  pasteFlowNoteClone: (
    target: PasteFlowNoteTarget,
  ) => Promise<string | undefined>;

  /**
   * Copying a note means the copied note will not be linked to the original note, so editing one will not affect the other.
   */
  copyFlowNote: (noteContentId: string) => Promise<void>;
  getCopiedFlowNote: () => { text: string; color: string } | undefined;
  pasteFlowNoteCopy: (
    target: PasteFlowNoteTarget,
  ) => Promise<string | undefined>;

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
  createFlowNote: async ({ nodeId, placement, text }) => {
    const flowId = get().id;
    const userId = get().user?.id;
    if (!flowId || !userId) return undefined;

    const { data } = await client.mutate({
      mutation: CREATE_FLOW_NOTE_POSITION,
      variables: {
        object: {
          flow_id: flowId,
          node_id: nodeId ?? null,
          placement: placement ?? null,
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

    return data?.insert_flow_note_positions_one?.id;
  },

  updateFlowNote: async (noteContentId, patch) => {
    const userId = get().user?.id;
    if (!userId) return;

    await client.mutate({
      mutation: UPDATE_FLOW_NOTE_CONTENT,
      variables: { id: noteContentId, set: { ...patch, updated_by: userId } },
    });
  },

  deleteFlowNote: async (positionId) => {
    await client.mutate({
      mutation: DELETE_FLOW_NOTE_POSITION,
      variables: { id: positionId },
    });
  },

  cloneFlowNote: (noteContentId) => {
    localStorage.setItem("clonedFlowNoteId", noteContentId);
    localStorage.removeItem("copiedFlowNote");
  },

  getClonedFlowNoteId: () => localStorage.getItem("clonedFlowNoteId"),

  pasteFlowNoteClone: async ({ nodeId, placement }) => {
    const flowId = get().id;
    const userId = get().user?.id;
    const noteContentId = get().getClonedFlowNoteId();
    if (!flowId || !userId || !noteContentId) return undefined;

    const { data } = await client.mutate({
      mutation: CREATE_FLOW_NOTE_POSITION,
      variables: {
        object: {
          flow_id: flowId,
          node_id: nodeId ?? null,
          placement: placement ?? null,
          created_by: userId,
          note_id: noteContentId,
        },
      },
    });

    return data?.insert_flow_note_positions_one?.id;
  },

  copyFlowNote: async (noteContentId) => {
    const { data } = await client.query<{
      flow_note_content_by_pk: { text: string; color: string } | null;
    }>({
      query: GET_FLOW_NOTE_CONTENT,
      variables: { id: noteContentId },
      fetchPolicy: "network-only",
    });
    if (!data?.flow_note_content_by_pk) return;

    localStorage.setItem(
      "copiedFlowNote",
      JSON.stringify(data.flow_note_content_by_pk),
    );
    localStorage.removeItem("clonedFlowNoteId");
  },

  getCopiedFlowNote: () => {
    const payload = localStorage.getItem("copiedFlowNote");
    return payload ? JSON.parse(payload) : undefined;
  },

  pasteFlowNoteCopy: async ({ nodeId, placement }) => {
    const flowId = get().id;
    const userId = get().user?.id;
    const copied = get().getCopiedFlowNote();

    if (!flowId || !userId || !copied) return undefined;

    const { data } = await client.mutate({
      mutation: CREATE_FLOW_NOTE_POSITION,
      variables: {
        object: {
          flow_id: flowId,
          node_id: nodeId ?? null,
          placement: placement ?? null,
          created_by: userId,
          note: {
            data: {
              text: copied.text,
              color: copied.color,
              created_by: userId,
              updated_by: userId,
            },
          },
        },
      },
    });

    return data?.insert_flow_note_positions_one?.id;
  },

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
  },
});
