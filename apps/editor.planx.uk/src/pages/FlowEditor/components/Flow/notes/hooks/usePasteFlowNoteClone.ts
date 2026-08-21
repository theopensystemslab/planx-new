import { useMutation } from "@apollo/client";
import type { FlowNoteTarget } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";

import { CREATE_FLOW_NOTE_POSITION } from "./mutations";
import { useClonedFlowNoteId } from "./useClonedFlowNoteId";

interface CreateFlowNotePositionResult {
  insertedNotePosition: { id: string } | null;
}

export const usePasteFlowNoteClone = () => {
  const flowId = useStore((state) => state.id);
  const [mutate, mutationState] = useMutation<CreateFlowNotePositionResult>(
    CREATE_FLOW_NOTE_POSITION,
  );
  const { getClonedFlowNoteId } = useClonedFlowNoteId();

  const pasteFlowNoteClone = async ({ nodeId, placement }: FlowNoteTarget) => {
    const userId = useStore.getState().user?.id;
    const noteContentId = getClonedFlowNoteId();
    if (!flowId || !userId || !noteContentId) return undefined;

    const { data } = await mutate({
      variables: {
        object: {
          flow_id: flowId,
          node_id: nodeId ?? null,
          placement: placement ?? null,
          created_by: userId,
          updated_by: userId,
          note_id: noteContentId,
        },
      },
    });

    return data?.insertedNotePosition?.id;
  };

  return { pasteFlowNoteClone, ...mutationState };
};
