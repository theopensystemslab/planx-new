import type { Graph } from "@planx/graph";
import type { FlowNote } from "hooks/data/useFlowNotes";

import { resolveNoteRenderCoordinate } from "./notePlacement";

export interface PartitionedNotes {
  attached: Map<string, FlowNote[]>;
  positioned: Map<string, FlowNote[]>;
}

export const placementKey = (parent: string, before?: string): string =>
  `${parent}::${before ?? ""}`;

/**
 * A note is a clone when its `contentId` (the shared `flow_note_content` row) is referenced by more than one position
 */
export const getClonedNoteContentIds = (notes: FlowNote[]): Set<string> => {
  const counts = new Map<string, number>();
  for (const note of notes) {
    counts.set(note.contentId, (counts.get(note.contentId) ?? 0) + 1);
  }

  const clonedContentIds = new Set<string>();
  for (const [contentId, count] of counts) {
    if (count > 1) clonedContentIds.add(contentId);
  }
  return clonedContentIds;
};

/**
 * Notes render at two different kinds of location, so the flow renderer needs two different lookups
 * attached notes are keyed by the nodeId they're pinned to
 * positioned notes sit in a gap between nodes and must be keyed by the resolved render coordinate instead (container, before)
 *
 * a note's stored `placement` doesn't map 1:1 to that coordinate (e.g. a cloned anchor can resolve differently depending its parent)
 * so this resolution has to happen once, up front, rather than per-render.
 */
export const partitionNotes = (
  notes: FlowNote[],
  flow: Graph,
): PartitionedNotes => {
  const attached = new Map<string, FlowNote[]>();
  const positioned = new Map<string, FlowNote[]>();

  for (const note of notes) {
    if (note.nodeId) {
      const bucket = attached.get(note.nodeId) ?? [];
      bucket.push(note);
      attached.set(note.nodeId, bucket);
    } else if (note.placement) {
      const { container, before } = resolveNoteRenderCoordinate(
        flow,
        note.placement,
      );
      const key = placementKey(container, before);
      const bucket = positioned.get(key) ?? [];
      bucket.push(note);
      positioned.set(key, bucket);
    }
  }

  return { attached, positioned };
};
