import type { FlowGraph } from "@opensystemslab/planx-core/types";
import merge from "lodash/merge.js";
import type { Flow } from "../../../types.js";

// I know it's a bit atypical to test a third-party function
//  But these unit tests help visualise various realistic flow-editing scenarios!

it("prioritises customised text and data field additions", () => {
  const sourceTemplate: FlowGraph = {
    _root: {
      edges: ["Question"],
    },
    Question: {
      type: 100,
      data: {
        text: "Which way?",
        neverAutoAnswer: false,
        alwaysAutoAnswerBlank: false,
        isTemplatedNode: true,
        templatedNodeInstructions: "Update this node",
        areTemplatedNodeInstructionsRequired: false,
      },
      edges: ["Option1", "Option2"],
    },
    Option1: {
      type: 200,
      data: {
        text: "Left",
      },
    },
    Option2: {
      type: 200,
      data: {
        text: "Right",
      },
    },
  };

  const templatedFlowEdits: Flow["data"] = {
    Question: {
      data: {
        text: "Which way??",
        fn: "direction",
      },
    },
    Option1: {
      data: {
        text: "Leftt",
        val: "left",
      },
    },
  };

  expect(merge(sourceTemplate, templatedFlowEdits)).toEqual({
    _root: {
      edges: ["Question"],
    },
    Question: {
      type: 100,
      data: {
        text: "Which way??",
        neverAutoAnswer: false,
        alwaysAutoAnswerBlank: false,
        fn: "direction",
        isTemplatedNode: true,
        templatedNodeInstructions: "Update this node",
        areTemplatedNodeInstructionsRequired: false,
      },
      edges: ["Option1", "Option2"],
    },
    Option1: {
      type: 200,
      data: {
        text: "Leftt",
        val: "left",
      },
    },
    Option2: {
      type: 200,
      data: {
        text: "Right",
      },
    },
  });
});
