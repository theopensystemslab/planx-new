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

test("only return page's children when page is the node that's currently active", () => {
  setState({
    flow: {
      _root: {
        edges: ["root_node1", "page", "root_node2"],
      },
      root_node1: {
        type: TYPES.Content,
      },
      page: {
        type: TYPES.Page,
        edges: ["page_node1", "page_node2"],
      },
      page_node1: {
        type: TYPES.Content,
      },
      page_node2: {
        type: TYPES.Content,
      },
      root_node2: {
        type: TYPES.Content,
      },
    },
  });

  // list all upcoming nodes, don't explore children of page node
  // as it is not the current (1st) node

  expect(getState().upcomingCardIds()).toEqual([
    "root_node1",
    "page", // this node has children, but we don't expand it and list them yet
    "root_node2",
  ]);

  // user visits the first root_node and clicks 'Continue'

  getState().record("root_node1", []);

  // now open up the page node and include its 2 children in the upcoming list

  // upcoming nodes = [a,b,PAGE,c,d] <- PAGE not first upcomingId, don't expand it

  // after visiting a,b, PAGE reaches the 0th index, so open it into an array -

  // upcoming nodes = [[PAGE, ...pageChildren],c,d] <- PAGE now first so we expand it into array

  expect(getState().upcomingCardIds()).toEqual([
    ["page", "page_node1", "page_node2"],
    "root_node2",
  ]);

  getState().record("page_node1", []);

  expect(getState().upcomingCardIds()).toEqual([
    ["page", "page_node2"],
    "root_node2",
  ]);

  getState().record("page_node2", []);

  // after there are no more nodes inside page, we then just show the nodes after it
  // upcoming nodes = [[PAGE, (no children)],c,d] => [c,d]

  expect(getState().upcomingCardIds()).toEqual(["root_node2"]);

  // user clicks continue on the final node
  getState().record("root_node2", []);

  // no more nodes left to visit
  expect(getState().upcomingCardIds()).toEqual([]);

  getState().record("page_node1");

  expect(getState().upcomingCardIds()).toEqual([
    ["page", "page_node1", "page_node2"],
    "root_node2",
  ]);
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
    a: { answers: ["c"], auto: true },
    d: { answers: ["e", "f"], auto: true },
  });

  getState().record("a");

  expect(getState().breadcrumbs).toEqual({});
});
