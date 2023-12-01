import { TYPES } from "@planx/components/types";

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
        type: TYPES.Statement,
        edges: ["c"],
      },
      b: {
        type: TYPES.Statement,
      },
      c: {
        type: TYPES.Response,
        edges: ["d"],
      },
      d: {
        type: TYPES.Statement,
        edges: ["e", "f"],
      },
      e: { type: TYPES.Response },
      f: { type: TYPES.Response },
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
