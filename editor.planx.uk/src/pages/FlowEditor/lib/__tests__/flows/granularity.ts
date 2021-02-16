import { TYPES } from "@planx/components/types";

export default {
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
