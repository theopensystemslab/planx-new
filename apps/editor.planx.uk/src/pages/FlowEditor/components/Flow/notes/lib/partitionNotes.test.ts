import type { FlowNote, NotePlacement } from "hooks/data/useFlowNotes";
import { describe, expect, it } from "vitest";

import { partitionNotes, placementKey } from "./partitionNotes";

let noteCounter = 0;

const baseNote = () => {
  noteCounter += 1;
  return {
    id: `note-${noteCounter}`,
    flowId: "flow-1",
    text: `Note ${noteCounter}`,
    color: "#fffdb0",
    createdBy: 1,
    updatedBy: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
};

const makeAttachedNote = (nodeId: string): FlowNote => ({
  ...baseNote(),
  nodeId,
  placement: null,
});

const makePositionedNote = (placement: NotePlacement): FlowNote => ({
  ...baseNote(),
  nodeId: null,
  placement,
});

describe("partitionNotes", () => {
  it("returns empty maps for empty input", () => {
    const { attached, positioned } = partitionNotes([], {});
    expect(attached.size).toBe(0);
    expect(positioned.size).toBe(0);
  });

  it("buckets a node_id-set note under attached, keyed by nodeId", () => {
    const note = makeAttachedNote("node-a");
    const { attached, positioned } = partitionNotes([note], {});

    expect(attached.get("node-a")).toEqual([note]);
    expect(positioned.size).toBe(0);
  });

  it("never places an attached note in the positioned map", () => {
    const note = makeAttachedNote("node-a");
    const { positioned } = partitionNotes([note], {});

    expect(positioned.get(placementKey("node-a"))).toBeUndefined();
  });

  it("buckets a container-anchored placement note under its exact (parent, before) key", () => {
    const note = makePositionedNote({
      parent: "container-a",
      before: "X",
      parentIsContainer: true,
    });
    const { positioned } = partitionNotes([note], {});

    expect(positioned.get(placementKey("container-a", "X"))).toEqual([note]);
  });

  it("buckets a placement note with no `before` into a distinct trailing bucket", () => {
    const before = makePositionedNote({
      parent: "container-a",
      before: "X",
      parentIsContainer: true,
    });
    const trailing = makePositionedNote({ parent: "container-a" });
    const { positioned } = partitionNotes([before, trailing], {});

    expect(positioned.get(placementKey("container-a", "X"))).toEqual([before]);
    expect(positioned.get(placementKey("container-a"))).toEqual([trailing]);
    expect(placementKey("container-a")).not.toBe(
      placementKey("container-a", "X"),
    );
  });

  it("does not leak notes across different parents sharing the same `before`", () => {
    const noteA = makePositionedNote({
      parent: "container-a",
      before: "X",
      parentIsContainer: true,
    });
    const noteB = makePositionedNote({
      parent: "container-b",
      before: "X",
      parentIsContainer: true,
    });
    const { positioned } = partitionNotes([noteA, noteB], {});

    expect(positioned.get(placementKey("container-a", "X"))).toEqual([noteA]);
    expect(positioned.get(placementKey("container-b", "X"))).toEqual([noteB]);
  });

  it("preserves insertion order for multiple notes at the same coordinate", () => {
    const first = makePositionedNote({
      parent: "container-a",
      before: "X",
      parentIsContainer: true,
    });
    const second = makePositionedNote({
      parent: "container-a",
      before: "X",
      parentIsContainer: true,
    });
    const { positioned } = partitionNotes([first, second], {});

    expect(positioned.get(placementKey("container-a", "X"))).toEqual([
      first,
      second,
    ]);
  });

  it("decodes a sibling-anchored placement (no before) using the current flow", () => {
    const flow = {
      _root: { edges: ["nodeA", "nodeB"] },
      nodeA: { type: 8 },
      nodeB: { type: 8 },
    };
    const note = makePositionedNote({ parent: "nodeA" });
    const { positioned } = partitionNotes([note], flow);

    expect(positioned.get(placementKey("_root", "nodeB"))).toEqual([note]);
  });
});
