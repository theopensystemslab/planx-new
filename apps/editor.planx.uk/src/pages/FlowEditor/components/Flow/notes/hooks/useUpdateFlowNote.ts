import { gql, useMutation } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

const UPDATE_FLOW_NOTE = gql`
  mutation UpdateFlowNote($id: uuid!, $set: flow_notes_set_input!) {
    update_flow_notes_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

export const useUpdateFlowNote = () => {
  const userId = useStore((state) => state.user?.id);
  const [mutate, mutationState] = useMutation(UPDATE_FLOW_NOTE);

  const updateFlowNote = async (id: string, patch: { text?: string }) => {
    if (!userId) return;

    await mutate({
      variables: { id, set: { ...patch, updated_by: userId } },
    });
  };

  return { updateFlowNote, ...mutationState };
};
