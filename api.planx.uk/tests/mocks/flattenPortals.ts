import { FlowGraph } from "@opensystemslab/planx-core/types";

export const mockDraftParent: FlowGraph = {
  _root: {
    edges: ["4rrycjaUGg", "IgXmnffRPH", "N2efCk7D3G"],
  },
  "4rrycjaUGg": {
    data: {
      text: "Are you doing works to a house in London?",
    },
    type: 100,
    edges: ["H5l1YcuVP4", "KJtvK7K2wn"],
  },
  H5l1YcuVP4: {
    data: {
      text: "Yes",
    },
    type: 200,
    edges: ["Z4QpXm6CyR"],
  },
  IgXmnffRPH: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
  KJtvK7K2wn: {
    data: {
      text: "No",
    },
    type: 200,
    edges: ["T0iJIxbOIn"],
  },
  N2efCk7D3G: {
    data: {
      color: "#EFEFEF",
      title: "End of test",
      resetButton: true,
    },
    type: 8,
  },
  T0iJIxbOIn: {
    data: {
      flowId: "63f80a88-b7b3-4554-b719-2293dd4de0d5",
    },
    type: 310,
  },
  Z4QpXm6CyR: {
    data: {
      flowId: "cb0ce521-2f8c-48e3-b61f-19e5f9e00a44",
    },
    type: 310,
  },
};

export const mockPublishedParent: FlowGraph = {
  _root: {
    edges: ["4rrycjaUGg", "IgXmnffRPH", "N2efCk7D3G"],
  },
  "4rrycjaUGg": {
    data: {
      text: "Are you doing works to a house in London?",
    },
    type: 100,
    edges: ["H5l1YcuVP4", "KJtvK7K2wn"],
  },
  H5l1YcuVP4: {
    data: {
      text: "Yes",
    },
    type: 200,
    edges: ["Z4QpXm6CyR"],
  },
  IgXmnffRPH: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
  KJtvK7K2wn: {
    data: {
      text: "No",
    },
    type: 200,
    edges: ["T0iJIxbOIn"],
  },
  N2efCk7D3G: {
    data: {
      color: "#EFEFEF",
      title: "End of test",
      resetButton: true,
    },
    type: 8,
  },
  T0iJIxbOIn: {
    type: 300,
    edges: ["63f80a88-b7b3-4554-b719-2293dd4de0d5"],
  },
  "63f80a88-b7b3-4554-b719-2293dd4de0d5": {
    data: {
      text: "testing/mock-units",
    },
    type: 300,
    edges: ["pAiZxKp2pZ"],
  },
  pAiZxKp2pZ: {
    data: {
      title: "How many bedrooms are you adding?",
      description: "<p>(This is v1)</p>",
    },
    type: 150,
  },
  Z4QpXm6CyR: {
    type: 300,
    edges: ["cb0ce521-2f8c-48e3-b61f-19e5f9e00a44"],
  },
  "cb0ce521-2f8c-48e3-b61f-19e5f9e00a44": {
    edges: ["8OfL0QE39s", "95iLrV22Dn"],
    type: 300,
    data: {
      text: "testing/mock-london-data-hub",
    },
  },
  "8OfL0QE39s": {
    data: {
      type: "short",
      title: "Which borough of London?",
    },
    type: 110,
  },
  "95iLrV22Dn": {
    type: 300,
    edges: ["63f80a88-b7b3-4554-b719-2293dd4de0d5"],
  },
};

export const mockLondonDataHub: FlowGraph = {
  _root: {
    edges: ["8OfL0QE39s", "95iLrV22Dn"],
  },
  "8OfL0QE39s": {
    data: {
      type: "short",
      title: "Which borough of London?",
    },
    type: 110,
  },
  "95iLrV22Dn": {
    data: {
      flowId: "63f80a88-b7b3-4554-b719-2293dd4de0d5",
    },
    type: 310,
  },
};

export const mockLondonDataHubPublishedUnitsV1: FlowGraph = {
  _root: {
    edges: ["8OfL0QE39s", "95iLrV22Dn"],
  },
  "8OfL0QE39s": {
    data: {
      type: "short",
      title: "Which borough of London?",
    },
    type: 110,
  },
  "95iLrV22Dn": {
    type: 300,
    edges: ["63f80a88-b7b3-4554-b719-2293dd4de0d5"],
  },
  pAiZxKp2pZ: {
    data: {
      title: "How many bedrooms are you adding?",
      description: "<p>(This is v1)</p>",
    },
    type: 150,
  },
  "63f80a88-b7b3-4554-b719-2293dd4de0d5": {
    data: {
      text: "testing/mock-units",
    },
    type: 300,
    edges: ["pAiZxKp2pZ"],
  },
};

export const mockUnits: FlowGraph = {
  _root: {
    edges: ["pAiZxKp2pZ"],
  },
  pAiZxKp2pZ: {
    data: {
      title: "How many bedrooms are you adding?",
      description: "<p>(This is v2)</p>",
    },
    type: 150,
  },
};

export const mockUnitsPublishedV1: FlowGraph = {
  _root: {
    edges: ["pAiZxKp2pZ"],
  },
  pAiZxKp2pZ: {
    data: {
      title: "How many bedrooms are you adding?",
      description: "<p>(This is v1)</p>",
    },
    type: 150,
  },
};

export const mockUnitsPublishedV2: FlowGraph = {
  _root: {
    edges: ["pAiZxKp2pZ"],
  },
  pAiZxKp2pZ: {
    data: {
      title: "How many bedrooms are you adding?",
      description: "<p>(This is v2)</p>",
    },
    type: 150,
  },
};
