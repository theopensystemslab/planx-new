import type { Graph } from "..";
import { insertGraph } from "..";

let count = 0;
const deterministicId = () => `ID_${count++}`;

beforeEach(() => {
  count = 0;
});

/** All graph nodes, minus _root */
const nodeIds = (graph: Graph) =>
  Object.keys(graph).filter((id) => id !== "_root");

const emptyFlow = (): Graph => ({ _root: { edges: [] } });

const pattern: Graph = {
  _root: { edges: ["question", "notice"] },
  question: { type: 100, data: { text: "Question?" }, edges: ["yes", "no"] },
  yes: { type: 200, data: { text: "Yes" } },
  no: { type: 200, data: { text: "No" } },
  notice: { type: 8, data: { title: "Notice" } },
};

describe("inserting a graph", () => {
  describe("basic behaviour", () => {
    test("adds every node from the source, with fresh ids", () => {
      const [graph] = insertGraph(pattern, { idFn: deterministicId })(
        emptyFlow(),
      );

      expect(graph).toEqual({
        _root: { edges: ["ID_0", "ID_3"] },
        ID_0: {
          type: 100,
          data: { text: "Question?" },
          edges: ["ID_1", "ID_2"],
        },
        ID_1: { type: 200, data: { text: "Yes" } },
        ID_2: { type: 200, data: { text: "No" } },
        ID_3: { type: 8, data: { title: "Notice" } },
      });
    });

    test("does not carry over the source's root node", () => {
      const [graph] = insertGraph(pattern, { idFn: deterministicId })(
        emptyFlow(),
      );

      // The only root is the destination's own, holding the new top level nodes
      expect(Object.keys(graph)).not.toContain("question");
      expect(graph["_root"]).toEqual({ edges: ["ID_0", "ID_3"] });
    });

    test("keeps the order of top level nodes", () => {
      const [graph] = insertGraph(pattern, { idFn: deterministicId })(
        emptyFlow(),
      );
      const [firstId, secondId] = graph["_root"].edges!;

      expect(graph[firstId].data).toEqual({ text: "Question?" });
      expect(graph[secondId].data).toEqual({ title: "Notice" });
    });

    test("inserts into a given parent, leaving the rest of the graph alone", () => {
      const existing: Graph = {
        _root: { edges: ["folder"] },
        folder: { type: 300, edges: ["existingChild"] },
        existingChild: { type: 8 },
      };

      const [graph] = insertGraph(pattern, {
        parent: "folder",
        idFn: deterministicId,
      })(existing);

      expect(graph["folder"].edges).toEqual(["existingChild", "ID_0", "ID_3"]);
      expect(graph["_root"]).toEqual({ edges: ["folder"] });
      expect(graph["existingChild"]).toEqual({ type: 8 });
    });

    test("inserts before a given sibling, in source order", () => {
      const existing: Graph = {
        _root: { edges: ["first", "last"] },
        first: { type: 8 },
        last: { type: 8 },
      };

      const [graph] = insertGraph(pattern, {
        before: "last",
        idFn: deterministicId,
      })(existing);

      expect(graph["_root"].edges).toEqual(["first", "ID_0", "ID_3", "last"]);
    });

    test("can insert the same source twice, without id collisions", () => {
      const [once] = insertGraph(pattern, { idFn: deterministicId })(
        emptyFlow(),
      );
      const firstCopy = nodeIds(once);

      const [twice] = insertGraph(pattern, { idFn: deterministicId })(once);
      const secondCopy = nodeIds(twice).filter((id) => !firstCopy.includes(id));

      // Both copies are present in full, sharing no nodes between them
      expect(firstCopy).toHaveLength(4);
      expect(secondCopy).toHaveLength(4);
      expect(nodeIds(twice)).toHaveLength(8);

      // Inserting again leaves the first copy untouched - edits can't bleed across
      // No unexpected "clone" behaviour introduced
      firstCopy.forEach((id) => expect(twice[id]).toEqual(once[id]));
    });
  });

  // This means that the entire "insert" can be reversed by a single "undo" in the History panel
  test("batches the entire insert in a single batch of ops", () => {
    const [, ops] = insertGraph(pattern, { idFn: deterministicId })(
      emptyFlow(),
    );

    const createdNodeIds = ops
      .filter((op) => "oi" in op && op.p.length === 1)
      .map((op) => op.p[0]);

    expect(createdNodeIds.sort()).toEqual(
      ["ID_0", "ID_1", "ID_2", "ID_3"].sort(),
    );
  });

  describe("clones", () => {
    const withClone: Graph = {
      _root: { edges: ["question"] },
      question: { type: 100, edges: ["optionA", "optionB"] },
      optionA: { type: 200, edges: ["clone"] },
      optionB: { type: 200, edges: ["clone"] },
      clone: { type: 8, data: { title: "clone!" } },
    };

    /** Follows both of a question's options, asserting they still meet at one node */
    const cloneBeneath = (graph: Graph, questionId: string) => {
      const [optionAId, optionBId] = graph[questionId].edges!;
      const viaOptionA = graph[optionAId].edges![0];
      const viaOptionB = graph[optionBId].edges![0];

      expect(viaOptionA).toBe(viaOptionB);

      return viaOptionA;
    };

    test("are kept as clones within a single insert", () => {
      const [graph] = insertGraph(withClone, { idFn: deterministicId })(
        emptyFlow(),
      );

      const [questionId] = graph["_root"].edges!;
      const cloneId = cloneBeneath(graph, questionId);

      expect(graph[cloneId].data).toEqual({ title: "clone!" });

      // Clones are not de-duplicated - relationship remains intact
      expect(nodeIds(graph)).toHaveLength(4);
    });

    test("are not shared between two inserts of the same pattern", () => {
      const [once] = insertGraph(withClone, { idFn: deterministicId })(
        emptyFlow(),
      );
      const [twice] = insertGraph(withClone, { idFn: deterministicId })(once);

      const [firstQuestionId, secondQuestionId] = twice["_root"].edges!;

      // Each insert maintains its own clone...
      const firstCloneId = cloneBeneath(twice, firstQuestionId);
      const secondCloneId = cloneBeneath(twice, secondQuestionId);

      // ...but the clones never meet
      // Clones are not shared across repetitions of the same pattern
      expect(firstCloneId).not.toBe(secondCloneId);
      expect(nodeIds(twice)).toHaveLength(8);
    });
  });

  describe("when there is nothing to insert", () => {
    test("an empty source results in no-op", () => {
      const existing: Graph = { _root: { edges: ["keep"] }, keep: {} };
      const [graph, ops] = insertGraph({}, { idFn: deterministicId })(existing);

      expect(graph).toEqual(existing);
      expect(ops).toEqual([]);
    });

    test("a source holding only a root is a no-op", () => {
      const existing: Graph = { _root: { edges: ["keep"] }, keep: {} };
      const [graph, ops] = insertGraph(
        { _root: { edges: [] } },
        {
          idFn: deterministicId,
        },
      )(existing);

      expect(graph).toEqual(existing);
      expect(ops).toEqual([]);
    });
  });
});
