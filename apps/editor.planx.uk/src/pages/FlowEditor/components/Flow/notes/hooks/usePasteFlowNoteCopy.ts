import { useMutation } from "@apollo/client";
import type { NotePlacement } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";

import { CREATE_FLOW_NOTE_POSITION } from "./mutations";
import { useCopiedFlowNote } from "./useCopiedFlowNote";

export interface PasteFlowNoteTarget {
  nodeId?: string;
  placement?: NotePlacement;
}

interface CreateFlowNotePositionResult {
  insert_flow_note_positions_one: { id: string } | null;
}

export const usePasteFlowNoteCopy = () => {
  const flowId = useStore((state) => state.id);
  const [mutate, mutationState] = useMutation<CreateFlowNotePositionResult>(
    CREATE_FLOW_NOTE_POSITION,
  );
  const { getCopiedFlowNote } = useCopiedFlowNote();

  const pasteFlowNoteCopy = async ({
    nodeId,
    placement,
  }: PasteFlowNoteTarget) => {
    const userId = useStore.getState().user?.id;
    const copied = getCopiedFlowNote();
    if (!flowId || !userId || !copied) return undefined;

    const { data } = await mutate({
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
  };

  return { pasteFlowNoteCopy, ...mutationState };
};
