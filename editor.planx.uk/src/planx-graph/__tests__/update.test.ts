import { update } from "..";

describe("updating", () => {
  describe("removeKeyIfMissing === false", () => {
    test("doesn't save empty fields", () => {
      const [graph, ops] = update("a", {
        ignoreBlank: "",
        ignore2: "↵",
        ignore3: "\u200B",
      })({
        a: {
          data: {
            xyz: 1,
          },
        },
      });

      expect(graph).toEqual({
        a: {
          data: {
            xyz: 1,
          },
        },
      });

      expect(ops).toEqual([]);
    });

    test("add a field to a without affecting existing data", () => {
      const [graph, ops] = update("a", { foo: "bar" })({
        a: {
          data: {
            xyz: 1,
          },
          edges: ["b"],
        },
        b: {},
      });

      expect(graph).toEqual({
        a: {
          data: {
            xyz: 1,
            foo: "bar",
          },
          edges: ["b"],
        },
        b: {},
      });

      expect(ops).toEqual([{ oi: "bar", p: ["a", "data", "foo"] }]);
    });

    test("replace existing data", () => {
      const [graph, ops] = update("a", { foo: "bar2" })({
        a: {
          data: {
            xyz: 1,
            foo: "bar",
          },
          edges: ["b"],
        },
        b: {},
      });

      expect(graph).toEqual({
        a: {
          data: {
            xyz: 1,
            foo: "bar2",
          },
          edges: ["b"],
        },
        b: {},
      });

      expect(ops).toEqual([{ od: "bar", oi: "bar2", p: ["a", "data", "foo"] }]);
    });

    test("remove existing data", () => {
      const [graph, ops] = update("a", { foo: null })({
        a: {
          data: {
            xyz: 1,
            foo: "bar",
          },
          edges: ["b"],
        },
        b: {},
      });

      expect(graph).toEqual({
        a: {
          data: {
            xyz: 1,
          },
          edges: ["b"],
        },
        b: {},
      });

      expect(ops).toEqual([{ od: "bar", p: ["a", "data", "foo"] }]);
    });
  });

  describe("removeKeyIfMissing === true", () => {
    test.todo("remove data if missing from newData");
    test.todo("remove children and data if missing from newData");
    test.todo("add children");
    test.todo("reorder children");
  });
});
