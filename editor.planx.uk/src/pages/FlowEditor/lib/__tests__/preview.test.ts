import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

test("it lists upcoming cards", () => {
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

  expect(getState().upcomingCardIds()).toEqual(["a"]);

  getState().record("a", ["c"]);

  expect(getState().upcomingCardIds()).toEqual(["d"]);

  getState().record("d", ["e", "f"]);

  expect(getState().upcomingCardIds()).toEqual([]);
});

test("notice", () => {
  setState({
    flow: {
      _root: {
        edges: ["a"],
      },
      a: {
        type: TYPES.Notice,
      },
    },
  });

  expect(getState().upcomingCardIds()).toEqual(["a"]);
});

test("crawling with portals", () => {
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

  expect(getState().upcomingCardIds()).toEqual(["c", "b"]);
});

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

    expect(() => getState().record("x", [])).toThrowError("id not found");
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
  getState().record("a", ["c"]);
  getState().record("d", ["e", "f"]);
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false },
    d: { answers: ["e", "f"], auto: false },
  });

  getState().record("a");

  expect(getState().breadcrumbs).toEqual({});
});

test("hasPaid is updated if a Pay component has been recorded", () => {
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
        type: TYPES.Pay,
      },

      d: { type: TYPES.Response },
      e: { type: TYPES.Review },
    },
  });

  getState().record("a", ["c"]);
  expect(getState().hasPaid()).toBe(false);

  getState().record("c", []);
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false },
    c: { answers: [], auto: false },
  });

  expect(getState().hasPaid()).toBe(true);
});
