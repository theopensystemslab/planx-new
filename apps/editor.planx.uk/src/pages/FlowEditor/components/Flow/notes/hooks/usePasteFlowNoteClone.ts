import { useMutation } from "@apollo/client";
import type { NotePlacement } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";

import { CREATE_FLOW_NOTE_POSITION } from "./mutations";

export interface PasteFlowNoteTarget {
  nodeId?: string;
  placement?: NotePlacement;
}

interface CreateFlowNotePositionResult {
  insert_flow_note_positions_one: { id: string } | null;
}

export const usePasteFlowNoteClone = () => {
  const flowId = useStore((state) => state.id);
  const [mutate, mutationState] = useMutation<CreateFlowNotePositionResult>(
    CREATE_FLOW_NOTE_POSITION,
  );

  const pasteFlowNoteClone = async ({
    nodeId,
    placement,
  }: PasteFlowNoteTarget) => {
    const userId = useStore.getState().user?.id;
    const noteContentId = useStore.getState().getClonedFlowNoteId();
    if (!flowId || !userId || !noteContentId) return undefined;

    const { data } = await mutate({
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
  };

  return { pasteFlowNoteClone, ...mutationState };
};
