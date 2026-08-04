import { gql, useSubscription } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

/** Anchored immediately after a sibling node */
export interface SiblingAnchoredPlacement {
  /** id of the preceding sibling node */
  parent: string;
  /** The container `parent` was resolved against at creation time - disambiguates `parent` when it's a cloned node referenced from multiple containers */
  container?: string;
  parentIsContainer?: false;
  before?: undefined;
}

/** Anchored to a container's leading/first-child slot (no preceding sibling to anchor to) */
export interface ContainerAnchoredPlacement {
  /** id of the container to insert into */
  parent: string;
  parentIsContainer: true;
  before?: string;
  container?: undefined;
}

export type NotePlacement =
  SiblingAnchoredPlacement | ContainerAnchoredPlacement;

/**
 * Mirrors the DB's `flow_note_positions` CHECK constraint: a note is either
 * attached to a node or positioned in a gap, never both, never neither.
 */
export type FlowNoteTarget =
  | { nodeId: string; placement?: never }
  | { nodeId?: never; placement: NotePlacement };

interface FlowNoteBase {
  /** Identifies this specific placement/clone instance - used for deletion */
  positionId: string;
  /** The same across every clone of this note - used for updating/cloning/copying */
  contentId: string;
  flowId: string;
  text: string;
  color: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttachedNote extends FlowNoteBase {
  nodeId: string;
  placement: null;
}

export interface PositionedNote extends FlowNoteBase {
  nodeId: null;
  placement: NotePlacement;
}

export type FlowNote = AttachedNote | PositionedNote;

const GET_FLOW_NOTES = gql`
  subscription GetFlowNotes($flowId: uuid!) {
    flow_note_positions(
      where: { flow_id: { _eq: $flowId } }
      order_by: { created_at: asc, id: asc }
    ) {
      id
      flow_id
      node_id
      placement
      note {
        id
        text
        color
        created_by
        updated_by
        created_at
        updated_at
      }
    }
  }
`;

interface FlowNotePositionRow {
  id: string;
  flow_id: string;
  node_id: string | null;
  placement: NotePlacement | null;
  note: {
    id: string;
    text: string;
    color: string;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
  };
}

interface QueryResult {
  flow_note_positions: FlowNotePositionRow[];
}

const toFlowNote = (row: FlowNotePositionRow): FlowNote => {
  const base = {
    positionId: row.id,
    contentId: row.note.id,
    flowId: row.flow_id,
    text: row.note.text,
    color: row.note.color,
    createdBy: row.note.created_by,
    updatedBy: row.note.updated_by,
    createdAt: row.note.created_at,
    updatedAt: row.note.updated_at,
  };

  return row.node_id
    ? { ...base, nodeId: row.node_id, placement: null }
    : { ...base, nodeId: null, placement: row.placement as NotePlacement };
};

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

  const notes = (data?.flow_note_positions ?? []).map(toFlowNote);

  return { notes, loading, error };
};
