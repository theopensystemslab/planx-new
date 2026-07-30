import { gql, useMutation } from "@apollo/client";
import type { NotePlacement } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";

const CREATE_FLOW_NOTE = gql`
  mutation CreateFlowNote($object: flow_notes_insert_input!) {
    insert_flow_notes_one(object: $object) {
      id
    }
  }
`;

interface CreateFlowNoteInput {
  nodeId?: string;
  placement?: NotePlacement;
  text: string;
}

interface CreateFlowNoteResult {
  insert_flow_notes_one: { id: string } | null;
}

export const useCreateFlowNote = () => {
  const flowId = useStore((state) => state.id);
  const [mutate, mutationState] =
    useMutation<CreateFlowNoteResult>(CREATE_FLOW_NOTE);

  const createFlowNote = async ({
    nodeId,
    placement,
    text,
  }: CreateFlowNoteInput) => {
    if (!flowId) return undefined;

    const { data } = await mutate({
      variables: {
        object: {
          flow_id: flowId,
          node_id: nodeId ?? null,
          placement: placement ?? null,
          text,
        },
      },
    });

    return data?.insert_flow_notes_one?.id;
  };

  return { createFlowNote, ...mutationState };
};
