import { useMutation } from "@apollo/client";
import type { FlowNoteTarget } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";

import { CREATE_FLOW_NOTE_POSITION } from "./mutations";

export type CreateFlowNoteInput = FlowNoteTarget & { text: string };

interface CreateFlowNotePositionResult {
  insert_flow_note_positions_one: { id: string } | null;
}

export const useCreateFlowNote = () => {
  const flowId = useStore((state) => state.id);
  const [mutate, mutationState] = useMutation<CreateFlowNotePositionResult>(
    CREATE_FLOW_NOTE_POSITION,
  );

  const createFlowNote = async ({
    nodeId,
    placement,
    text,
  }: CreateFlowNoteInput) => {
    const userId = useStore.getState().user?.id;
    if (!flowId || !userId) return undefined;

    const { data } = await mutate({
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
  };

  return { createFlowNote, ...mutationState };
};
