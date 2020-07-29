import { createDoc, getConnection } from "./sharedb";
import { Flow, Op, removeNodeOp } from "./flow";

const createTest = (
  documentName: string,
  initial: Flow,
  ops: Op[],
  expected: Flow
) => {
  const testFn = async (done) => {
    const doc = getConnection(documentName);
    await createDoc(doc, initial);

    doc.on("op", () => {
      expect(doc.data).toEqual(expected);
      done();
      return;
    });

    doc.submitOp(ops);
  };
  return testFn;
};

// TEST 1

test(
  "leave the graph alone",
  createTest("alone", { nodes: {}, edges: [] }, [], { nodes: {}, edges: [] })
);

// TEST 2

const before1: Flow = {
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

const after1: Flow = {
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
  createTest("simple", before1, removeNodeOp("a2", null, before1), after1)
);
