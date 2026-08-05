import { gql } from "@apollo/client";

export const CREATE_FLOW_NOTE_POSITION = gql`
  mutation CreateFlowNotePosition($object: flow_note_positions_insert_input!) {
    insertedNotePosition: insert_flow_note_positions_one(object: $object) {
      id
    }
  }
`;

export const REANCHOR_FLOW_NOTE_POSITION = gql`
  mutation ReanchorFlowNotePosition($id: uuid!, $placement: jsonb!) {
    update_flow_note_positions_by_pk(
      pk_columns: { id: $id }
      _set: { placement: $placement }
    ) {
      id
    }
  }
`;
