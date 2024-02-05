import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { vanillaStore } from "../../store";

const { getState, setState } = vanillaStore;
const { record } = getState();

describe("error handling", () => {
  test("cannot record id that doesn't exist", () => {
    setState({
      flow: {
        _root: {
          edges: ["a", "b"],
        },
        a: {
          type: TYPES.InternalPortal,
          edges: ["c"],
        },
        b: {
          edges: ["d"],
        },
        c: {
          edges: ["d"],
        },
        d: {},
      },
    });

    expect(() => record("x", {})).toThrow("id not found");
  });
});

test("record(id, undefined) clears up breadcrumbs", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Question,
        edges: ["c"],
      },
      b: {
        type: TYPES.Question,
      },
      c: {
        type: TYPES.Answer,
        edges: ["d"],
      },
      d: {
        type: TYPES.Question,
        edges: ["e", "f"],
      },
      e: { type: TYPES.Answer },
      f: { type: TYPES.Answer },
    },
  });
  record("a", { answers: ["c"] });
  record("d", { answers: ["e", "f"] });
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false },
    d: { answers: ["e", "f"], auto: false },
  });

  record("a");

  expect(getState().breadcrumbs).toEqual({});
});
