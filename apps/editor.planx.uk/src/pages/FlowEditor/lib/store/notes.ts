import { gql } from "@apollo/client";
import type { NotePlacement } from "hooks/data/useFlowNotes";
import { client } from "lib/graphql";
import type { StateCreator } from "zustand";

import type { AuthStore } from "./auth";
import type { SharedStore } from "./shared";

const CREATE_FLOW_NOTE = gql`
  mutation CreateFlowNote($object: flow_notes_insert_input!) {
    insert_flow_notes_one(object: $object) {
      id
    }
  }
`;

const UPDATE_FLOW_NOTE = gql`
  mutation UpdateFlowNote($id: uuid!, $set: flow_notes_set_input!) {
    update_flow_notes_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

const DELETE_FLOW_NOTE = gql`
  mutation DeleteFlowNote($id: uuid!) {
    delete_flow_notes_by_pk(id: $id) {
      id
    }
  }
`;

export interface CreateFlowNoteInput {
  nodeId?: string;
  placement?: NotePlacement;
  text: string;
}

export interface NotesStore {
  createFlowNote: (input: CreateFlowNoteInput) => Promise<string | undefined>;
  updateFlowNote: (id: string, patch: { text?: string }) => Promise<void>;
  deleteFlowNote: (id: string) => Promise<void>;
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
      mutation: CREATE_FLOW_NOTE,
      variables: {
        object: {
          flow_id: flowId,
          node_id: nodeId ?? null,
          placement: placement ?? null,
          text,
          created_by: userId,
          updated_by: userId,
        },
      },
    });

    return data?.insert_flow_notes_one?.id;
  },

  updateFlowNote: async (id, patch) => {
    const userId = get().user?.id;
    if (!userId) return;

    await client.mutate({
      mutation: UPDATE_FLOW_NOTE,
      variables: { id, set: { ...patch, updated_by: userId } },
    });
  },

  deleteFlowNote: async (id) => {
    await client.mutate({
      mutation: DELETE_FLOW_NOTE,
      variables: { id },
    });
  },
});
