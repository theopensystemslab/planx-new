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
    flowNotePositions: flow_note_positions(
      where: { flow_id: { _eq: $flowId } }
      order_by: { created_at: asc, id: asc }
    ) {
      positionId: id
      flowId: flow_id
      nodeId: node_id
      placement
      note {
        contentId: id
        text
        color
        createdBy: created_by
        updatedBy: updated_by
        createdAt: created_at
        updatedAt: updated_at
      }
    }
  }
`;

interface FlowNotePositionRow {
  positionId: string;
  flowId: string;
  nodeId: string | null;
  placement: NotePlacement | null;
  note: {
    contentId: string;
    text: string;
    color: string;
    createdBy: number;
    updatedBy: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface QueryResult {
  flowNotePositions: FlowNotePositionRow[];
}

const toFlowNote = (row: FlowNotePositionRow): FlowNote => {
  const base = {
    positionId: row.positionId,
    contentId: row.note.contentId,
    flowId: row.flowId,
    text: row.note.text,
    color: row.note.color,
    createdBy: row.note.createdBy,
    updatedBy: row.note.updatedBy,
    createdAt: row.note.createdAt,
    updatedAt: row.note.updatedAt,
  };

  return row.nodeId
    ? { ...base, nodeId: row.nodeId, placement: null }
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

  const notes = (data?.flowNotePositions ?? []).map(toFlowNote);

  return { notes, loading, error };
};
