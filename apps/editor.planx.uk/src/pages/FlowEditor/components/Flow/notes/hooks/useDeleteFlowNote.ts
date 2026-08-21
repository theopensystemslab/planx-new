import { gql, useMutation } from "@apollo/client";

// TODO also set updated_by
const DELETE_FLOW_NOTE_POSITION = gql`
  mutation DeleteFlowNotePosition($id: uuid!) {
    update_flow_note_positions_by_pk(
      pk_columns: { id: $id }
      _set: { deleted_at: "now()" }
    ) {
      id
    }
  }
`;

export const useDeleteFlowNote = () => {
  const [mutate, mutationState] = useMutation(DELETE_FLOW_NOTE_POSITION);

  const deleteFlowNote = async (positionId: string) => {
    await mutate({ variables: { id: positionId } });
  };

  return { deleteFlowNote, ...mutationState };
};
