import { gql, useMutation } from "@apollo/client";

const DELETE_FLOW_NOTE_POSITION = gql`
  mutation DeleteFlowNotePosition($id: uuid!) {
    delete_flow_note_positions_by_pk(id: $id) {
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
