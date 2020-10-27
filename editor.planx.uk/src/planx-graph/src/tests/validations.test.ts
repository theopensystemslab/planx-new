import { graph } from "./setup.test";

const tests = [
  ["clone", true],
  ["move", false],
];

tests.forEach(([operation, isClone]) => {
  describe(`validating ${operation}s`, () => {
    test(`cannot ${operation} to same parent`, () => {
      graph.load({
        _root: {
          edges: ["a", "b"],
        },
        a: {
          edges: ["b"],
        },
        b: {},
      });

      expect(() =>
        graph.move("b", {
          fromParent: "_root",
          toParent: "a",
          clone: isClone,
        })
      ).toThrowError("same parent");
    });

    test("cannot create cycle", () => {
      graph.load({
        _root: {
          edges: ["a"],
        },
        a: {
          edges: ["b"],
        },
        b: {},
      });

      expect(() =>
        graph.move("a", {
          fromParent: "_root",
          toParent: "b",
          clone: isClone,
        })
      ).toThrowError("cycle");
    });
  });
});
