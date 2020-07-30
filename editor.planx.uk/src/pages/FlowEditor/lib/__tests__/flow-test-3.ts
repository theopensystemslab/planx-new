import { createTest } from "./shared";
import { Flow, addNodeWithChildrenOp } from "../flow";

const beforeFlow: Flow = { edges: [], nodes: {} };

const afterFlow: Flow = {
  edges: [
    [null, "q1"],
    ["q1", "a1"],
    ["q1", "a2"],
  ],
  nodes: {
    q1: { $t: 100, text: "Q1" },
    a1: { text: "A1", $t: 200 },
    a2: { text: "A2", $t: 200 },
  },
};

test(
  "adds child nodes",
  createTest(
    "simple2",
    beforeFlow,
    addNodeWithChildrenOp(
      { id: "q1", $t: 100, text: "Q1" },
      [
        { id: "a1", text: "A1", $t: 200 },
        { id: "a2", text: "A2", $t: 200 },
      ],
      null,
      null,
      beforeFlow
    ),
    afterFlow
  )
);
