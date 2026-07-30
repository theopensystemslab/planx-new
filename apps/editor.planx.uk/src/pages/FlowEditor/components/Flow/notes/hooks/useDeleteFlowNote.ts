import { gql, useMutation } from "@apollo/client";

const DELETE_FLOW_NOTE = gql`
  mutation DeleteFlowNote($id: uuid!) {
    delete_flow_notes_by_pk(id: $id) {
      id
    }
  }
`;

export const useDeleteFlowNote = () => {
  const [mutate, mutationState] = useMutation(DELETE_FLOW_NOTE);

  const deleteFlowNote = async (id: string) => {
    await mutate({ variables: { id } });
  };

  return { deleteFlowNote, ...mutationState };
};
