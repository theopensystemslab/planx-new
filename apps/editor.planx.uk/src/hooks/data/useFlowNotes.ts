import { gql, useSubscription } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

export const DEFAULT_NOTE_COLOR = "#fffdb0";

export interface NotePlacement {
  parent: string;
  before?: string;
  /** True when `parent` is the container to insert into (leading/first-child slot), not a preceding sibling to anchor after */
  parentIsContainer?: boolean;
}

export interface FlowNote {
  id: string;
  flowId: string;
  nodeId: string | null;
  placement: NotePlacement | null;
  text: string;
  color: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

const GET_FLOW_NOTES = gql`
  subscription GetFlowNotes($flowId: uuid!) {
    flow_notes(where: { flow_id: { _eq: $flowId } }) {
      id
      flow_id
      node_id
      placement
      text
      color
      created_by
      updated_by
      created_at
      updated_at
    }
  }
`;

interface FlowNoteRow {
  id: string;
  flow_id: string;
  node_id: string | null;
  placement: NotePlacement | null;
  text: string;
  color: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

interface QueryResult {
  flow_notes: FlowNoteRow[];
}

const toFlowNote = (row: FlowNoteRow): FlowNote => ({
  id: row.id,
  flowId: row.flow_id,
  nodeId: row.node_id,
  placement: row.placement,
  text: row.text,
  color: row.color,
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

interface UseFlowNotesResult {
  notes: FlowNote[];
  loading: boolean;
}

export const useFlowNotes = (): UseFlowNotesResult => {
  const flowId = useStore((state) => state.id);

  const { data, loading } = useSubscription<QueryResult>(GET_FLOW_NOTES, {
    variables: { flowId },
    skip: !flowId,
  });

  const notes = (data?.flow_notes ?? []).map(toFlowNote);

  return { notes, loading };
};
