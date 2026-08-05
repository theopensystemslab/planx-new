import { gql, useMutation } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

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

export const useUpdateFlowNote = () => {
  const [mutate, mutationState] = useMutation(UPDATE_FLOW_NOTE_CONTENT);

  const updateFlowNote = async (
    noteContentId: string,
    patch: { text?: string },
  ) => {
    const userId = useStore.getState().user?.id;
    if (!userId) return;

    await mutate({
      variables: { id: noteContentId, set: { ...patch, updated_by: userId } },
    });
  };

  return { updateFlowNote, ...mutationState };
};
