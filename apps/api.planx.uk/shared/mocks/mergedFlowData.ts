import {
  ComponentType,
  type FlowGraph,
  type Value,
} from "@opensystemslab/planx-core/types";

/**
 * Draft parent flow data which includes 3 nested flow nodes (2 unique flows) and 1 folder
 */
export const draftParentFlow: FlowGraph = {
  _root: {
    edges: ["DQRnJfTvkq", "JtWhixLQQD", "r6ZeA1GFpU", "n0t3"],
  },
  "45vie6vizK": {
    data: {
      content: "<h1>Folder</h1><p>This is content in a folder</p>",
      resetButton: false,
      tags: [],
      notes: "Remember to internally review this content",
    },
    type: ComponentType.Content,
  },
  DQRnJfTvkq: {
    data: {
      tags: [],
      text: "Which branch?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
      notes: "Remember to internally review this question",
    },
    type: ComponentType.Question,
    edges: ["jTi25P1WkE", "xwVz9s9ZVQ", "f6zoaYuboI"],
  },
  f6zoaYuboI: {
    data: {
      text: "C",
    },
    type: ComponentType.Answer,
  },
  jTi25P1WkE: {
    data: {
      text: "A",
    },
    type: ComponentType.Answer,
    edges: ["0ND9E0ov0D"],
  },
  xwVz9s9ZVQ: {
    data: {
      text: "B",
    },
    type: ComponentType.Answer,
    edges: ["UZWjLKDsBv"],
  },
  r6ZeA1GFpU: {
    type: ComponentType.InternalPortal,
    data: {
      text: "Folder",
    },
    edges: ["45vie6vizK"],
  },
  "0ND9E0ov0D": {
    type: ComponentType.ExternalPortal,
    data: {
      flow: {
        id: "nested-a",
        name: "Nested A",
        slug: "nested-a",
        team: "API",
      },
      flowId: "nested-a",
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  UZWjLKDsBv: {
    type: ComponentType.ExternalPortal,
    data: {
      flow: {
        id: "nested-a",
        name: "Nested A",
        slug: "nested-a",
        team: "API",
      },
      flowId: "nested-a",
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  JtWhixLQQD: {
    type: ComponentType.ExternalPortal,
    data: {
      flow: {
        id: "nested-b",
        name: "Nested B",
        slug: "nested-b",
        team: "API",
      },
      flowId: "nested-b",
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  n0t3: {
    type: ComponentType.Note,
    data: {
      text: "This is a sticky note",
      tags: ["toReview"],
    },
  },
};

/**
 * Flattened parent flow
 *  - Published versions of each nested flow by default, draft version of parent flow
 *  - External portals (aka nested flows) have been converted to internal portals (folders)
 *  - Repeated references to the same nested flow are de-duplicated (eg each unique flow is only flattened once)
 */
export const flattenedParentFlow: FlowGraph = {
  _root: {
    edges: ["DQRnJfTvkq", "JtWhixLQQD", "r6ZeA1GFpU", "n0t3"],
  },
  "0ND9E0ov0D": {
    type: ComponentType.InternalPortal,
    edges: ["nested-a"],
    data: {
      flattenedFromExternalPortal: true,
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  "nested-a": {
    edges: ["P3bEBTSeQd"],
    type: ComponentType.InternalPortal,
    data: {
      text: "testing/nested-a",
      flattenedFromExternalPortal: true,
      templatedFrom: undefined as unknown as Value,
      publishedAt: "2026-05-15T02:12:32.889893+00:00",
      publishedBy: 1,
      publishedFlowId: 9,
      summary: "Testing a",
    },
  },
  P3bEBTSeQd: {
    data: {
      content: "<h1>Nested A</h1><p>This is nested flow content</p><p></p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  "45vie6vizK": {
    data: {
      tags: [],
      content: "<h1>Folder</h1><p>This is content in a folder</p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  DQRnJfTvkq: {
    data: {
      tags: [],
      text: "Which branch?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: ComponentType.Question,
    edges: ["jTi25P1WkE", "xwVz9s9ZVQ", "f6zoaYuboI"],
  },
  JtWhixLQQD: {
    type: ComponentType.InternalPortal,
    edges: ["nested-b"],
    data: {
      flattenedFromExternalPortal: true,
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  "nested-b": {
    edges: ["g4fB7FE0cz"],
    type: ComponentType.InternalPortal,
    data: {
      text: "testing/nested-b",
      flattenedFromExternalPortal: true,
      templatedFrom: undefined as unknown as Value,
      publishedAt: "2026-05-15T02:12:48.760153+00:00",
      publishedBy: 1,
      publishedFlowId: 10,
      summary: "Testing b",
    },
  },
  g4fB7FE0cz: {
    data: {
      content: "<h1>Nested B</h1><p>This is nested flow content</p><p></p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  UZWjLKDsBv: {
    type: ComponentType.InternalPortal,
    edges: ["nested-a"],
    data: {
      flattenedFromExternalPortal: true,
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  f6zoaYuboI: {
    data: {
      text: "C",
    },
    type: ComponentType.Answer,
  },
  jTi25P1WkE: {
    data: {
      text: "A",
    },
    type: ComponentType.Answer,
    edges: ["0ND9E0ov0D"],
  },
  r6ZeA1GFpU: {
    data: {
      text: "Folder",
    },
    type: ComponentType.InternalPortal,
    edges: ["45vie6vizK"],
  },
  xwVz9s9ZVQ: {
    data: {
      text: "B",
    },
    type: ComponentType.Answer,
    edges: ["UZWjLKDsBv"],
  },
  n0t3: {
    type: ComponentType.Note,
  },
};

/**
 * Flattened parent flow
 *  - Draft flows all the way down, otherwise same as above
 */
export const flattenedParentFlowDraftOnly: FlowGraph = {
  _root: {
    edges: ["DQRnJfTvkq", "JtWhixLQQD", "r6ZeA1GFpU", "n0t3"],
  },
  "0ND9E0ov0D": {
    type: ComponentType.InternalPortal,
    edges: ["nested-a"],
    data: {
      flattenedFromExternalPortal: true,
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  "nested-a": {
    edges: ["P3bEBTSeQd"],
    type: ComponentType.InternalPortal,
    data: {
      text: "testing/nested-a",
      flattenedFromExternalPortal: true,
      templatedFrom: undefined as unknown as Value,
    },
  },
  P3bEBTSeQd: {
    data: {
      content:
        "<h1>Nested A</h1><p>This is UNPUBLISHED nested flow content</p><p></p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  "45vie6vizK": {
    data: {
      tags: [],
      content: "<h1>Folder</h1><p>This is content in a folder</p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  DQRnJfTvkq: {
    data: {
      tags: [],
      text: "Which branch?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: ComponentType.Question,
    edges: ["jTi25P1WkE", "xwVz9s9ZVQ", "f6zoaYuboI"],
  },
  JtWhixLQQD: {
    type: ComponentType.InternalPortal,
    edges: ["nested-b"],
    data: {
      flattenedFromExternalPortal: true,
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  "nested-b": {
    edges: ["g4fB7FE0cz"],
    type: ComponentType.InternalPortal,
    data: {
      text: "testing/nested-b",
      flattenedFromExternalPortal: true,
      templatedFrom: undefined as unknown as Value,
    },
  },
  g4fB7FE0cz: {
    data: {
      content:
        "<h1>Nested B</h1><p>This is UNPUBLISHED nested flow content</p><p></p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  UZWjLKDsBv: {
    type: ComponentType.InternalPortal,
    edges: ["nested-a"],
    data: {
      flattenedFromExternalPortal: true,
      isTemplatedNode: false,
      areTemplatedNodeInstructionsRequired: false,
    },
  },
  f6zoaYuboI: {
    data: {
      text: "C",
    },
    type: ComponentType.Answer,
  },
  jTi25P1WkE: {
    data: {
      text: "A",
    },
    type: ComponentType.Answer,
    edges: ["0ND9E0ov0D"],
  },
  r6ZeA1GFpU: {
    data: {
      text: "Folder",
    },
    type: ComponentType.InternalPortal,
    edges: ["45vie6vizK"],
  },
  xwVz9s9ZVQ: {
    data: {
      text: "B",
    },
    type: ComponentType.Answer,
    edges: ["UZWjLKDsBv"],
  },
  n0t3: {
    type: ComponentType.Note,
  },
};

export const draftNestedFlowA: FlowGraph = {
  _root: {
    edges: ["P3bEBTSeQd"],
  },
  P3bEBTSeQd: {
    data: {
      content:
        "<h1>Nested A</h1><p>This is UNPUBLISHED nested flow content</p><p></p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
};

export const publishedNestedFlowA: FlowGraph = {
  _root: {
    edges: ["P3bEBTSeQd"],
  },
  P3bEBTSeQd: {
    data: {
      content: "<h1>Nested A</h1><p>This is nested flow content</p><p></p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
};

export const draftNestedFlowB: FlowGraph = {
  _root: {
    edges: ["g4fB7FE0cz"],
  },
  g4fB7FE0cz: {
    type: ComponentType.Content,
    data: {
      content:
        "<h1>Nested B</h1><p>This is UNPUBLISHED nested flow content</p><p></p>",
      resetButton: false,
      notes: "This is an un-sanitised internal note",
    },
  },
};

export const publishedNestedFlowB: FlowGraph = {
  _root: {
    edges: ["g4fB7FE0cz"],
  },
  g4fB7FE0cz: {
    type: ComponentType.Content,
    data: {
      content: "<h1>Nested B</h1><p>This is nested flow content</p><p></p>",
      resetButton: false,
    },
  },
};
