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

  expect(getState().upcomingCardIds()).toEqual([["a"]]);

  getState().record("a", ["c"]);

  expect(getState().upcomingCardIds()).toEqual([["d"]]);

  getState().record("d", ["e", "f"]);

  expect(getState().upcomingCardIds()).toEqual([]);
});

test("display all upcomingCards when inside a page", () => {
  setState({
    flow: {
      _root: {
        edges: ["intro", "page", "last"],
      },
      intro: {
        type: TYPES.Content,
      },
      page: {
        type: TYPES.Page,
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Content,
      },
      b: {
        type: TYPES.Content,
      },
      last: {
        type: TYPES.Content,
      },
    },
  });

  expect(getState().upcomingCardIds()).toEqual([
    ["intro"],
    ["page", "a", "b"],
    ["last"],
  ]);

  getState().record("intro", []);

  expect(getState().upcomingCardIds()).toEqual([["page", "a", "b"], ["last"]]);
  getState().record("a", []);
  expect(getState().upcomingCardIds()).toEqual([["page", "b"], ["last"]]);
  getState().record("b", []);
  expect(getState().upcomingCardIds()).toEqual([["last"]]);
  getState().record("last", []);
  expect(getState().upcomingCardIds()).toEqual([]);

  getState().record("a");
  expect(getState().upcomingCardIds()).toEqual([["page", "a", "b"], ["last"]]);
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

  expect(getState().upcomingCardIds()).toEqual([["a"]]);
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

  expect(getState().upcomingCardIds()).toEqual([["c", "b"]]);
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
