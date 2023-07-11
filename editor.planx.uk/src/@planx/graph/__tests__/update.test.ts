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
    test("remove data if missing from newData", () => {
      const [graph, ops] = update(
        "a",
        { foo: "bar2" },
        { removeKeyIfMissing: true }
      )({
        a: {
          data: {
            xyz: 1,
            foo: "bar",
          },
        },
      });

      expect(graph).toEqual({
        a: {
          data: {
            foo: "bar2",
          },
        },
      });

      expect(ops).toEqual([
        { od: 1, p: ["a", "data", "xyz"] },
        { od: "bar", oi: "bar2", p: ["a", "data", "foo"] },
      ]);
    });

    test("remove children and data if missing from newData", () => {
      const [graph, ops] = update(
        "a",
        { foo: "bar2" },
        { children: [{ id: "d" }], removeKeyIfMissing: true }
      )({
        a: {
          data: {
            foo: "bar2",
          },
          edges: ["c", "d"],
        },
        b: {},
        c: {
          edges: ["e"],
        },
        d: {},
        e: {},
      });

      expect(graph).toEqual({
        a: {
          data: {
            foo: "bar2",
          },
          edges: ["d"],
        },
        b: {},
        d: {},
      });

      expect(ops).toEqual([
        { od: ["c", "d"], oi: ["d"], p: ["a", "edges"] },
        { od: { edges: ["e"] }, p: ["c"] },
        { od: {}, p: ["e"] },
      ]);
    });

    describe("adding children", () => {
      test("node with children", () => {
        const [graph, ops] = update(
          "x",
          { foo: "bar" },
          {
            children: [
              { id: "y", text: "newtext" },
              { type: 2, data: { text: "xyz" } },
              { id: "z" },
            ],
            removeKeyIfMissing: true,
          }
        )({
          _root: {
            edges: ["x"],
          },
          x: {
            data: {
              foo: "bar",
            },
            edges: ["y", "z"],
          },
          y: {},
          z: {},
        });

        const {
          x: {
            edges: [, newChildId],
          },
        } = graph as any;

        expect(graph).toEqual({
          _root: {
            edges: ["x"],
          },
          x: {
            data: {
              foo: "bar",
            },
            edges: ["y", newChildId, "z"],
          },
          y: {
            data: {
              text: "newtext",
            },
          },
          z: {},
          [newChildId]: {
            type: 2,
            data: { text: "xyz" },
          },
        });

        expect(ops).toEqual([
          { od: ["y", "z"], oi: ["y", newChildId, "z"], p: ["x", "edges"] },
          { oi: { text: "newtext" }, p: ["y", "data"] },
          { oi: { data: { text: "xyz" }, type: 2 }, p: [newChildId] },
        ]);
      });

      test("node without children", () => {
        const [graph, ops] = update(
          "x",
          { foo: "bar" },
          {
            children: [{ type: 1, data: { text: "foo" } }],
            removeKeyIfMissing: true,
          }
        )({
          _root: {
            edges: ["x"],
          },
          x: {
            data: {
              foo: "bar",
            },
          },
        });

        const {
          x: {
            edges: [newChildId],
          },
        } = graph as any;

        expect(graph).toEqual({
          _root: {
            edges: ["x"],
          },
          x: {
            data: {
              foo: "bar",
            },
            edges: [newChildId],
          },
          [newChildId]: {
            type: 1,
            data: {
              text: "foo",
            },
          },
        });

        expect(ops).toEqual([
          { oi: [newChildId], p: ["x", "edges"] },
          { oi: { data: { text: "foo" }, type: 1 }, p: [newChildId] },
        ]);
      });
    });

    test("update children", () => {
      const [graph, ops] = update(
        "a",
        {},
        {
          children: [
            {
              id: "b",
              text: "bar",
            },
          ],
          removeKeyIfMissing: true,
        }
      )({
        _root: {
          edges: ["a"],
        },
        a: {
          edges: ["b"],
        },
        b: {
          data: {
            text: "foo",
          },
        },
      });

      expect(graph).toEqual({
        _root: {
          edges: ["a"],
        },
        a: {
          edges: ["b"],
        },
        b: {
          data: {
            text: "bar",
          },
        },
      });

      expect(ops).toEqual([{ od: "foo", oi: "bar", p: ["b", "data", "text"] }]);
    });

    test("reorder children", () => {
      const [graph, ops] = update(
        "a",
        {},
        { children: [{ id: "c" }, { id: "b" }], removeKeyIfMissing: true }
      )({
        a: {
          edges: ["b", "c"],
        },
        b: {},
        c: {},
      });

      expect(graph).toEqual({
        a: {
          edges: ["c", "b"],
        },
        b: {},
        c: {},
      });

      expect(ops).toEqual([
        { od: ["b", "c"], oi: ["c", "b"], p: ["a", "edges"] },
      ]);
    });

    test("don't affect children if they're not included", () => {
      const [graph, ops] = update(
        "a",
        { text: "new portal name" },
        { removeKeyIfMissing: true }
      )({
        _root: { edges: ["a"] },
        a: {
          type: 300,
          data: {
            text: "a portal",
          },
          edges: ["b", "c"],
        },
        b: {},
        c: {},
      });

      expect(graph).toEqual({
        _root: { edges: ["a"] },
        a: {
          type: 300,
          data: {
            text: "new portal name",
          },
          edges: ["b", "c"],
        },
        b: {},
        c: {},
      });

      expect(ops).toEqual([
        { od: "a portal", oi: "new portal name", p: ["a", "data", "text"] },
      ]);
    });
  });
});

describe("error handling", () => {
  test("invalid id", () => {
    expect(() =>
      update(
        "x",
        {}
      )({
        _root: {
          edges: ["a"],
        },
        a: {},
      })
    ).toThrow("id not found");
  });
});

describe("complex example with node data", () => {
  describe("node with array", () => {
    test("updating a non-array field", () => {
      const dataFromFormik = {
        title: "Upload and label",
        description: "",
        fn: "",
        fileTypes: [
          {
            name: "11",
            fn: "22",
            rule: {
              condition: "AlwaysRequired",
            },
          },
        ],
        hideDropZone: true,
      };

      const [graph, ops] = update(
        "a",
        dataFromFormik
      )({
        a: {
          type: 145,
          data: {
            title: "Upload and label",
            fileTypes: [
              {
                name: "11",
                fn: "22",
                rule: {
                  condition: "AlwaysRequired",
                },
              },
            ],
            hideDropZone: false,
          },
        },
      });

      expect(graph).toEqual({
        a: {
          type: 145,
          data: {
            title: "Upload and label",
            fileTypes: [
              {
                name: "11",
                fn: "22",
                rule: {
                  condition: "AlwaysRequired",
                },
              },
            ],
            hideDropZone: true,
          },
        },
      });

      expect(ops).toEqual([
        {
          od: false,
          oi: true,
          p: ["a", "data", "hideDropZone"],
        },
      ]);
    });

    test("updating an array field", () => {
      const dataFromFormik = {
        title: "Upload and label",
        description: "",
        fn: "",
        fileTypes: [
          {
            name: "11",
            fn: "22",
            rule: {
              condition: "AlwaysRequired",
            },
          },
          {
            name: "33",
            fn: "44",
            rule: {
              condition: "AlwaysRequired",
            },
          },
        ],
        hideDropZone: true,
      };

      const [graph, ops] = update(
        "a",
        dataFromFormik
      )({
        a: {
          type: 145,
          data: {
            title: "Upload and label",
            fileTypes: [
              {
                name: "11",
                fn: "22",
                rule: {
                  condition: "AlwaysRequired",
                },
              },
            ],
            hideDropZone: true,
          },
        },
      });

      expect(graph).toEqual({
        a: {
          type: 145,
          data: {
            title: "Upload and label",
            fileTypes: [
              {
                name: "11",
                fn: "22",
                rule: {
                  condition: "AlwaysRequired",
                },
              },
              {
                name: "33",
                fn: "44",
                rule: {
                  condition: "AlwaysRequired",
                },
              },
            ],
            hideDropZone: true,
          },
        },
      });

      expect(ops).toEqual([
        {
          od: [
            {
              name: "11",
              fn: "22",
              rule: {
                condition: "AlwaysRequired",
              },
            },
          ],
          oi: [
            {
              name: "11",
              fn: "22",
              rule: {
                condition: "AlwaysRequired",
              },
            },
            {
              name: "33",
              fn: "44",
              rule: {
                condition: "AlwaysRequired",
              },
            },
          ],
          p: ["a", "data", "fileTypes"],
        },
      ]);
    });
  });
});
