import type { Flow } from "../../../types.js";

// the original flow
export const mockFlowData: Flow["data"] = {
  _root: {
    edges: ["rUilJQTag1", "kNX8Rej9rk"],
  },
  rUilJQTag1: {
    type: 100,
    data: {
      text: "Copy or paste?",
    },
    edges: ["Yh7t91FisE", "h8DSw40zNr"],
  },
  Yh7t91FisE: {
    type: 200,
    data: {
      text: "Copy",
    },
  },
  h8DSw40zNr: {
    type: 200,
    data: {
      text: "Paste",
    },
  },
  kNX8Rej9rk: {
    type: 110,
    data: {
      title: "Why do you want to copy this flow?",
      type: "short",
    },
  },
};
// the copied flow data with unique nodeIds using the replaceValue
const mockCopiedFlowData: Flow["data"] = {
  _root: {
    edges: ["rUilJT3ST1", "kNX8RT3ST1"],
  },
  rUilJT3ST1: {
    type: 100,
    data: {
      text: "Copy or paste?",
    },
    edges: ["Yh7t9T3ST1", "h8DSwT3ST1"],
  },
  Yh7t9T3ST1: {
    type: 200,
    data: {
      text: "Copy",
    },
  },
  h8DSwT3ST1: {
    type: 200,
    data: {
      text: "Paste",
    },
  },
  kNX8RT3ST1: {
    type: 110,
    data: {
      title: "Why do you want to copy this flow?",
      type: "short",
    },
  },
};
export const mockCopyFlowResponse = {
  message: `Successfully copied undefined`, // 'undefined' just reflects that we haven't mocked a flow.name here!
  inserted: false,
  replaceValue: "T3ST1",
  data: mockCopiedFlowData,
};
export const mockCopyFlowResponseInserted = {
  message: `Successfully copied undefined`,
  inserted: true,
  replaceValue: "T3ST1",
  data: mockCopiedFlowData,
};
