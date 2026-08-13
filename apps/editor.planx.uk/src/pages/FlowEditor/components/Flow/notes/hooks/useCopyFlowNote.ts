import { gql, useLazyQuery } from "@apollo/client";

import { useSetCopiedFlowNote } from "./useSetCopiedFlowNote";

const GET_FLOW_NOTE_CONTENT = gql`
  query GetFlowNoteContent($id: uuid!) {
    noteContent: flow_note_content_by_pk(id: $id) {
      text
    }
  }
`;

interface GetFlowNoteContentResult {
  noteContent: { text: string } | null;
}

export const useCopyFlowNote = () => {
  const [fetchContent, queryState] = useLazyQuery<GetFlowNoteContentResult>(
    GET_FLOW_NOTE_CONTENT,
    { fetchPolicy: "network-only" },
  );
  const { setCopiedFlowNote } = useSetCopiedFlowNote();

  const copyFlowNote = async (noteContentId: string) => {
    const { data } = await fetchContent({ variables: { id: noteContentId } });
    if (!data?.noteContent) return;

    setCopiedFlowNote(data.noteContent);
  };

  return { copyFlowNote, ...queryState };
};
