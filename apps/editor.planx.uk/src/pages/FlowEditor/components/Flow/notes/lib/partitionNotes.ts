import type { Graph } from "@planx/graph";
import type { FlowNote } from "hooks/data/useFlowNotes";

import { resolveNoteRenderCoordinate } from "./notePlacement";

export interface PartitionedNotes {
  attached: Map<string, FlowNote[]>;
  positioned: Map<string, FlowNote[]>;
}

export const placementKey = (parent: string, before?: string): string =>
  `${parent}::${before ?? ""}`;

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
