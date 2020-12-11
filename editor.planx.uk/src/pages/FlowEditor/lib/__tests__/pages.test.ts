import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
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
        edges: ["page_node1", "page_node3"],
      },
      page_node1: {
        type: TYPES.Statement,
        edges: ["page_node1_a", "page_node1_b"],
      },
      page_node1_a: {
        type: TYPES.Response,
        edges: ["page_node2"],
      },
      page_node1_b: {
        type: TYPES.Response,
      },
      page_node2: {
        type: TYPES.Content,
      },
      page_node3: {
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
    ["page", ["page_node1", "page_node3"], "page_node1"],
    "root_node2",
  ]);

  getState().record("page_node1", ["page_node1_a"]);

  // expect(getState().upcomingCardIds()).toEqual([
  //   ["page", ["page_node1", "page_node2", "page_node3"], "page_node2"],
  //   "root_node2",
  // ]);
  expect(getState().upcomingCardIds()).toEqual(1);

  getState().record("page_node2", []);

  expect(getState().upcomingCardIds()).toEqual([
    ["page", ["page_node1", "page_node2", "page_node3"], "page_node3"],
    "root_node2",
  ]);

  getState().record("page_node3", []);

  // after there are no more nodes inside page, we then just show the nodes after it
  // upcoming nodes = [[PAGE, (no children)],c,d] => [c,d]

  expect(getState().upcomingCardIds()).toEqual(["root_node2"]);

  // user clicks continue on the final node
  getState().record("root_node2", []);

  // no more nodes left to visit
  expect(getState().upcomingCardIds()).toEqual([]);

  getState().record("page_node1");

  expect(getState().upcomingCardIds()).toEqual([
    ["page", ["page_node1", "page_node3"], "page_node1"],
    "root_node2",
  ]);
});
