import gql from "graphql-tag";
import { client } from "lib/graphql";
import { Feedback } from "routes/feedback";

export const updateEditorNotes = async (updatedRow: Feedback) => {
  await client.mutate({
    mutation: gql`
      mutation UpdateEditorNotes($id: Int!, $editor_notes: String) {
        update_feedback_by_pk(
          pk_columns: { id: $id }
          _set: { editor_notes: $editor_notes }
        ) {
          id
        }
      }
    `,
    variables: {
      id: updatedRow.id,
      editor_notes: updatedRow.editorNotes,
    },
    update: (cache) => {
      // As we're reading from feedback_summary but pushing an update to feedback, we need to manually invalidate Apollo's cache
      cache.evict({ fieldName: "feedback_summary" });
      cache.gc();
    },
  });
};
