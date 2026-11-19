import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";

import { type MergedGraph, sanitiseNotes } from "./dataMerged.js";
import { dataUnmerged } from "./dataUnmerged.js";
import {
  draftParentFlow,
  flattenedParentFlow,
  flattenedParentFlowDraftOnly,
} from "./mocks/mergedFlowData.js";

describe("dataUnmerged() function", () => {
  // Original draft parent flow, without notes and with simplified nested flow metadata (as neither can be recovered)
  const expectedUnmergedFlow = sanitiseNotes(
    Object.fromEntries(
      // Cast FlowGraph type MergedGraph here because we can't guarantee `_root` node while iterating
      Object.entries(draftParentFlow as MergedGraph).map(([nodeId, node]) => {
        if (node?.type === ComponentType.ExternalPortal) {
          const { flow: _flow, ...data } = node.data!;
          return [nodeId, { ...node, data }];
        }
        return [nodeId, node];
      }),
    ),
  );

  it("restores external portal nodes and removes nested flow content from a flattened published flow", () => {
    expect(dataUnmerged(flattenedParentFlow)).toEqual(expectedUnmergedFlow);
  });

  it("restores external portal nodes and removes nested flow content from a flattened draft flow", () => {
    expect(dataUnmerged(flattenedParentFlowDraftOnly)).toEqual(
      expectedUnmergedFlow,
    );
  });

  it("does not leave any flattened portal nodes behind", () => {
    const result = dataUnmerged(flattenedParentFlow);

    expect(result).not.toHaveProperty("nested-a");
    expect(result).not.toHaveProperty("nested-b");
    expect(result).not.toHaveProperty("P3bEBTSeQd");
    expect(result).not.toHaveProperty("g4fB7FE0cz");
    expect(
      Object.values(result).some(
        (node) => "data" in node && node.data?.flattenedFromExternalPortal,
      ),
    ).toBe(false);
  });

  it("only unflattens the top level when nested flows are nested within each other", () => {
    const flattened: FlowGraph = {
      _root: { edges: ["portalToA"] },
      portalToA: {
        type: ComponentType.InternalPortal,
        edges: ["nested-a"],
        data: { flattenedFromExternalPortal: true },
      },
      "nested-a": {
        type: ComponentType.InternalPortal,
        edges: ["portalToC"],
        data: { text: "testing/nested-a", flattenedFromExternalPortal: true },
      },
      portalToC: {
        type: ComponentType.InternalPortal,
        edges: ["nested-c"],
        data: { flattenedFromExternalPortal: true },
      },
      "nested-c": {
        type: ComponentType.InternalPortal,
        edges: ["contentC"],
        data: { text: "testing/nested-c", flattenedFromExternalPortal: true },
      },
      contentC: { type: ComponentType.Content, data: { content: "C" } },
    };

    expect(dataUnmerged(flattened)).toEqual({
      _root: { edges: ["portalToA"] },
      portalToA: {
        type: ComponentType.ExternalPortal,
        data: { flowId: "nested-a" },
      },
    });
  });

  it("doesn't change an already flattened flow", () => {
    expect(dataUnmerged(draftParentFlow)).toEqual(draftParentFlow);
  });
});
