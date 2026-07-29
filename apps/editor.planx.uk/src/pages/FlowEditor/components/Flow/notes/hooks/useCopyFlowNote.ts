import { gql, useLazyQuery } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

const GET_FLOW_NOTE_CONTENT = gql`
  query GetFlowNoteContent($id: uuid!) {
    flow_note_content_by_pk(id: $id) {
      text
      color
    }
  }
`;

interface GetFlowNoteContentResult {
  flow_note_content_by_pk: { text: string; color: string } | null;
}

export const useCopyFlowNote = () => {
  const [fetchContent, queryState] = useLazyQuery<GetFlowNoteContentResult>(
    GET_FLOW_NOTE_CONTENT,
    { fetchPolicy: "network-only" },
  );

  const copyFlowNote = async (noteContentId: string) => {
    const { data } = await fetchContent({ variables: { id: noteContentId } });
    if (!data?.flow_note_content_by_pk) return;

    useStore.getState().setCopiedFlowNote(data.flow_note_content_by_pk);
  };

  return { copyFlowNote, ...queryState };
};
