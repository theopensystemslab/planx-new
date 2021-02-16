import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

const flow = {
  _root: {
    edges: ["whatisit"],
  },
  whatisit: {
    type: TYPES.Statement,
    edges: ["food", "tool"],
    data: {
      fn: "item",
    },
  },
  food: {
    type: TYPES.Response,
    data: {
      val: "food",
    },
    edges: ["whichfood"],
  },
  tool: {
    type: TYPES.Response,
    data: {
      val: "tool",
    },
  },
  whichfood: {
    type: TYPES.Statement,
    edges: ["fruit", "cake"],
    data: {
      fn: "item",
    },
  },
  fruit: {
    type: TYPES.Response,
    data: {
      val: "food.fruit",
    },
  },
  cake: {
    type: TYPES.Response,
    data: {
      val: "food.cake",
    },
  },
};

beforeEach(() => {
  getState().resetPreview();
  setState({ flow });

  getState().record("whatisit", ["food"]);
  // expect(getState().passport).toEqual({ data: { item: { value: ["food"] } } });
  // expect(getState().upcomingCardIds()).toEqual(["whichfood"]);

  getState().record("whichfood", ["fruit"]);
});

// ┌───────┐     ┌───────────┐
// │ tool  │ ◀── │ whatisit  │
// └───────┘     └───────────┘
//                 │
//                 ▼
//               ┌───────────┐
//               │   food    │
//               └───────────┘
//                 │
//                 ▼
// ┌───────┐     ┌───────────┐
// │ fruit │ ◀── │ whichfood │
// └───────┘     └───────────┘
//                 │
//                 ▼
//               ┌───────────┐
//               │   cake    │
//               └───────────┘

it("overwrites existing var with a more granular one if found", () => {
  expect(getState().passport).toEqual({
    data: { item: { value: ["food.fruit"] } },
  });
});

it("resets the var when going back up the flow", () => {
  getState().record("whichfood");
  expect(getState().upcomingCardIds()).toEqual(["whichfood"]);
  expect(getState().passport).toEqual({
    data: { item: { value: ["food"] } },
  });
});
