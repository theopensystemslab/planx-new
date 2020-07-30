import { createTest } from "./shared";
import { Flow, removeNodeOp } from "../flow";

const beforeFlow: Flow = {
  edges: [
    [null, "q1"],
    ["q1", "a1"],
    ["q1", "a2"],
  ],
  nodes: {
    a2: {
      $t: 200,
      text: "A2",
    },
    q1: {
      $t: 100,
      text: "Q1",
    },
    a1: {
      $t: 200,
      text: "A1",
    },
  },
};

const afterFlow: Flow = {
  edges: [
    [null, "q1"],
    ["q1", "a1"],
  ],
  nodes: {
    q1: {
      $t: 100,
      text: "Q1",
    },
    a1: {
      $t: 200,
      text: "A1",
    },
  },
};

test(
  "removes a simple child node",
  createTest(
    "simple",
    beforeFlow,
    removeNodeOp("a2", "q1", beforeFlow),
    afterFlow
  )
);
