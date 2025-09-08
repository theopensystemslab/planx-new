import type { FlowGraph } from "@opensystemslab/planx-core/types";

import type { Flow } from "../../../types.js";
import { customMerge } from "./service.js";

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

  expect(customMerge(sourceTemplate, templatedFlowEdits)).toEqual({
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

it("handles templated folders where a new node has been added", () => {
  const sourceTemplate: FlowGraph = {
    _root: {
      edges: ["Folder"],
    },
    Folder: {
      type: 300,
      edges: ["Content"],
      data: {
        text: "Folder",
        isTemplatedNode: true,
        templatedNodeInstructions:
          "You can empty this folder if you don't want to ask these questions",
      },
    },
    Content: {
      type: 250,
      data: {
        content: "<h1>Test</h1><p>This is some example content</p>",
      },
    },
  };

  const templatedFlowEdits: Flow["data"] = {
    Folder: {
      edges: ["Content", "ContentNew"],
    },
    ContentNew: {
      type: 250,
      data: {
        content: "NEW !",
      },
    },
  };

  expect(customMerge(sourceTemplate, templatedFlowEdits)).toEqual({
    _root: {
      edges: ["Folder"],
    },
    Folder: {
      type: 300,
      edges: ["Content", "ContentNew"],
      data: {
        text: "Folder",
        isTemplatedNode: true,
        templatedNodeInstructions:
          "You can empty this folder if you don't want to ask these questions",
      },
    },
    Content: {
      type: 250,
      data: {
        content: "<h1>Test</h1><p>This is some example content</p>",
      },
    },
    ContentNew: {
      type: 250,
      data: {
        content: "NEW !",
      },
    },
  });
});

it("handles templated folders where all nodes have been removed", () => {
  const sourceTemplate: FlowGraph = {
    _root: {
      edges: ["Folder"],
    },
    Folder: {
      type: 300,
      edges: ["Content"],
      data: {
        text: "Folder",
        isTemplatedNode: true,
        templatedNodeInstructions:
          "You can empty this folder if you don't want to ask these questions",
      },
    },
    Content: {
      type: 250,
      data: {
        content: "<h1>Test</h1><p>This is some example content</p>",
      },
    },
  };

  const templatedFlowEdits: Flow["data"] = {
    Folder: {
      edges: [],
    },
  };

  expect(customMerge(sourceTemplate, templatedFlowEdits)).toEqual({
    _root: {
      edges: ["Folder"],
    },
    Folder: {
      type: 300,
      edges: [],
      data: {
        text: "Folder",
        isTemplatedNode: true,
        templatedNodeInstructions:
          "You can empty this folder if you don't want to ask these questions",
      },
    },
  });
});

it("handles templated upload and label nodes where rules have been removed, added, and re-ordered", () => {
  const sourceTemplate: FlowGraph = {
    _root: {
      edges: ["UploadAndLabel"],
    },
    UploadAndLabel: {
      type: 145,
      data: {
        title: "Upload and label",
        fileTypes: [
          {
            name: "Site plan",
            fn: "sitePlan.proposed",
            rule: {
              condition: "AlwaysRequired",
            },
          },
          {
            name: "Design and access statement",
            fn: "designAndAccessStatement",
            rule: {
              condition: "AlwaysRecommended",
            },
          },
        ],
        hideDropZone: false,
        tags: [],
        isTemplatedNode: true,
        templatedNodeInstructions: "Set your local file requirements",
      },
    },
  };

  // Remove design & access, add heritage statement, re-order so site plan is last
  const templatedFlowEdits: Flow["data"] = {
    UploadAndLabel: {
      data: {
        fileTypes: [
          {
            fn: "heritageStatement",
            name: "Heritage statement",
            rule: {
              condition: "AlwaysRequired",
            },
          },
          {
            fn: "sitePlan.proposed",
            name: "Site plan",
            rule: {
              condition: "AlwaysRequired",
            },
            moreInformation: {
              info: "<p>It shows where the work is happening</p>",
            },
          },
        ],
      },
    },
  };

  expect(customMerge(sourceTemplate, templatedFlowEdits)).toEqual({
    _root: {
      edges: ["UploadAndLabel"],
    },
    UploadAndLabel: {
      type: 145,
      data: {
        title: "Upload and label",
        fileTypes: [
          {
            fn: "heritageStatement",
            name: "Heritage statement",
            rule: {
              condition: "AlwaysRequired",
            },
          },
          {
            fn: "sitePlan.proposed",
            name: "Site plan",
            rule: {
              condition: "AlwaysRequired",
            },
            moreInformation: {
              info: "<p>It shows where the work is happening</p>",
            },
          },
        ],
        hideDropZone: false,
        tags: [],
        isTemplatedNode: true,
        templatedNodeInstructions: "Set your local file requirements",
      },
    },
  });
});
