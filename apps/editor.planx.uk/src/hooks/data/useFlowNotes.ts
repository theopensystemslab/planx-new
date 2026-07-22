import { gql, useSubscription } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";
import type { SnakeCasedProperties } from "type-fest";

export const DEFAULT_NOTE_COLOR = "#fffdb0";

export interface NotePlacement {
  parent: string;
  before?: string;
  /** True when `parent` is the container to insert into (leading/first-child slot) */
  parentIsContainer?: boolean;
  /** The container `parent` was resolved against at creation time - disambiguates `parent` when it's a cloned node referenced from multiple containers */
  container?: string;
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
type FlowNoteRow = SnakeCasedProperties<FlowNote>;

const GET_FLOW_NOTES = gql`
  subscription GetFlowNotes($flowId: uuid!) {
    flow_notes(
      where: { flow_id: { _eq: $flowId } }
      order_by: { created_at: asc, id: asc }
    ) {
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
  error: unknown;
}

export const useFlowNotes = (): UseFlowNotesResult => {
  const flowId = useStore((state) => state.id);

  const { data, loading, error } = useSubscription<QueryResult>(
    GET_FLOW_NOTES,
    {
      variables: { flowId },
      skip: !flowId,
    },
  );

  const notes = (data?.flow_notes ?? []).map(toFlowNote);

  return { notes, loading, error };
};
