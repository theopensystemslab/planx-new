import type { Graph } from "@planx/graph";
import { describe, expect, it } from "vitest";

import {
  findContainerOf,
  resolveNotePlacement,
  resolveNoteRenderCoordinate,
} from "./notePlacement";

// _root -> nodeA -> nodeB -> nodeC (a plain linear root-level sequence,
const linearFlow: Graph = {
  _root: { edges: ["nodeA", "nodeB", "nodeC"] },
  nodeA: { type: 8, data: { title: "Node A" } },
  nodeB: { type: 8, data: { title: "Node B" } },
  nodeC: { type: 8, data: { title: "Node C" } },
};

describe("findContainerOf", () => {
  it("finds the node whose edges contain the given id", () => {
    expect(findContainerOf(linearFlow, "nodeB")).toBe("_root");
  });

  it("returns undefined for a node with no container (e.g. _root itself)", () => {
    expect(findContainerOf(linearFlow, "_root")).toBeUndefined();
  });
});

describe("resolveNotePlacement (encode)", () => {
  it("anchors to the preceding sibling when one exists", () => {
    // note between nodeA and nodeB
    expect(resolveNotePlacement(linearFlow, "_root", "nodeB")).toEqual({
      parent: "nodeA",
      container: "_root",
    });
  });

  it("anchors to the last child when trailing (no `before` given, preceding sibling exists)", () => {
    expect(resolveNotePlacement(linearFlow, "_root", undefined)).toEqual({
      parent: "nodeC",
      container: "_root",
    });
  });

  it("falls back to container + before when there is no preceding sibling (leading position)", () => {
    expect(resolveNotePlacement(linearFlow, "_root", "nodeA")).toEqual({
      parent: "_root",
      before: "nodeA",
      parentIsContainer: true,
    });
  });

  it("falls back to container with no before when the container is empty", () => {
    const flow: Graph = { _root: {} };
    expect(resolveNotePlacement(flow, "_root", undefined)).toEqual({
      parent: "_root",
      before: undefined,
      parentIsContainer: true,
    });
  });

  it("marks the placement as container-anchored when added as the first child of an empty, non-root folder", () => {
    const flow: Graph = {
      _root: { edges: ["folder"] },
      folder: { type: 300, edges: [] },
    };
    expect(resolveNotePlacement(flow, "folder", undefined)).toEqual({
      parent: "folder",
      before: undefined,
      parentIsContainer: true,
    });
  });

  it("throws an error when before node is not found in container", () => {
    const flow: Graph = {
      _root: { edges: ["folder"] },
      folder: { type: 300, edges: ["nodeA"] },
    };
    expect(() => resolveNotePlacement(flow, "folder", "nodeB")).toThrow(
      "before node nodeB not found in container folder",
    );
  });
});

describe("resolveNoteRenderCoordinate (decode)", () => {
  it("resolves a sibling-anchored placement to (its container, the next sibling)", () => {
    expect(
      resolveNoteRenderCoordinate(linearFlow, { parent: "nodeA" }),
    ).toEqual({ container: "_root", before: "nodeB" });
  });

  it("resolves a trailing sibling anchor (last child) to (container, undefined)", () => {
    expect(
      resolveNoteRenderCoordinate(linearFlow, { parent: "nodeC" }),
    ).toEqual({ container: "_root", before: undefined });
  });

  it("resolves a container-anchored (leading) placement directly", () => {
    expect(
      resolveNoteRenderCoordinate(linearFlow, {
        parent: "_root",
        before: "nodeA",
        parentIsContainer: true,
      }),
    ).toEqual({ container: "_root", before: "nodeA" });
  });

  it("treats parent === _root as a container even with no before (legacy placement without the flag)", () => {
    expect(
      resolveNoteRenderCoordinate(linearFlow, { parent: "_root" }),
    ).toEqual({ container: "_root", before: undefined });
  });

  it("resolves a container-anchored placement into an empty, non-root folder", () => {
    const flow: Graph = {
      _root: { edges: ["folder"] },
      folder: { type: 300, edges: [] },
    };
    expect(
      resolveNoteRenderCoordinate(flow, {
        parent: "folder",
        before: undefined,
        parentIsContainer: true,
      }),
    ).toEqual({ container: "folder", before: undefined });
  });

  it("still resolves a sibling-anchored placement pointing at an (empty) folder to after that folder, not inside it", () => {
    // folder is the last child of _root and happens to be empty - without
    // `parentIsContainer` this must NOT be mistaken for "insert inside folder"
    const flow: Graph = {
      _root: { edges: ["nodeA", "folder"] },
      nodeA: linearFlow.nodeA,
      folder: { type: 300, edges: [] },
    };
    expect(resolveNoteRenderCoordinate(flow, { parent: "folder" })).toEqual({
      container: "_root",
      before: undefined,
    });
  });

  it("round-trips through encode then decode back to the original gap", () => {
    const gaps: Array<{ container: string; before?: string }> = [
      { container: "_root", before: "nodeA" },
      { container: "_root", before: "nodeB" },
      { container: "_root", before: "nodeC" },
      { container: "_root", before: undefined },
    ];

    for (const gap of gaps) {
      const placement = resolveNotePlacement(
        linearFlow,
        gap.container,
        gap.before,
      );
      expect(resolveNoteRenderCoordinate(linearFlow, placement)).toEqual(gap);
    }
  });

  it("round-trips a note added as the first child of an empty, non-root folder", () => {
    const flow: Graph = {
      _root: { edges: ["folder"] },
      folder: { type: 300, edges: [] },
    };
    const gap = { container: "folder", before: undefined };

    const placement = resolveNotePlacement(flow, gap.container, gap.before);
    expect(resolveNoteRenderCoordinate(flow, placement)).toEqual(gap);
  });

  describe("cloned anchor nodes", () => {
    // "shared" is a cloned node i.e. referenced from two different parents ("b" and "a")
    // key order would place the note before b due to order but actually we want it to use a
    const cloneFlow: Graph = {
      _root: { edges: ["a", "b"] },
      b: { type: 8, edges: ["shared"] },
      a: { type: 8, edges: ["shared"] },
      shared: { type: 8 },
    };

    it("encode stores the container a cloned sibling was resolved against", () => {
      expect(resolveNotePlacement(cloneFlow, "a", undefined)).toEqual({
        parent: "shared",
        container: "a",
      });
    });

    it("decode uses the stored container rather than guessing via findContainerOf", () => {
      expect(findContainerOf(cloneFlow, "shared")).toBe("b");
      expect(
        resolveNoteRenderCoordinate(cloneFlow, {
          parent: "shared",
          container: "a",
        }),
      ).toEqual({ container: "a", before: undefined });
    });

    it("falls back to findContainerOf's (possibly wrong) match for legacy placements with no stored container", () => {
      expect(
        resolveNoteRenderCoordinate(cloneFlow, { parent: "shared" }),
      ).toEqual({ container: "b", before: undefined });
    });

    it("round-trips a note anchored after a cloned sibling", () => {
      const gap = { container: "a", before: undefined };
      const placement = resolveNotePlacement(
        cloneFlow,
        gap.container,
        gap.before,
      );
      expect(resolveNoteRenderCoordinate(cloneFlow, placement)).toEqual(gap);
    });
  });
});
