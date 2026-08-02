import type { Store } from "..";
import { stripTemplatedNodeProps } from "./stripTemplatedNodeProps";

describe("stripTemplatedNodeProps", () => {
  it("removes every templated-node prop from data", () => {
    const node: Store.Node = {
      type: 100,
      data: {
        text: "A question",
        isTemplatedNode: true,
        templatedNodeInstructions: "Fill this in",
        areTemplatedNodeInstructionsRequired: true,
      },
    };

    expect(stripTemplatedNodeProps(node).data).toEqual({
      text: "A question",
    });
  });

  it("leaves data untouched when there's nothing to strip", () => {
    const node: Store.Node = { type: 100, data: { text: "A question" } };

    expect(stripTemplatedNodeProps(node).data).toEqual({
      text: "A question",
    });
  });

  it("leaves a node with no data as-is", () => {
    const node: Store.Node = { type: 100 };

    expect(stripTemplatedNodeProps(node)).toEqual({ type: 100 });
  });

  it("leaves the rest of the node untouched", () => {
    const node: Store.Node = {
      type: 100,
      edges: ["a", "b"],
      data: { text: "A question", isTemplatedNode: true },
    };

    expect(stripTemplatedNodeProps(node)).toEqual({
      type: 100,
      edges: ["a", "b"],
      data: { text: "A question" },
    });
  });

  it("does not mutate the node passed in", () => {
    const node: Store.Node = {
      type: 100,
      data: { text: "A question", isTemplatedNode: true },
    };

    stripTemplatedNodeProps(node);

    expect(node.data).toEqual({
      text: "A question",
      isTemplatedNode: true,
    });
  });
});
