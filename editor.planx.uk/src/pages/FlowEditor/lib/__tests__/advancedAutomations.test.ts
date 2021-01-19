const flow = {
  _root: {
    edges: [
      "Imks7j68BD",
      "HV0gV8DOil",
      "2PT6bTPTqj",
      "3H2bGdzpIN",
      "AFX3QwbOCd",
    ],
  },
  "0LzMSk4JTO": {
    data: {
      val: "food.bread",
      text: "bread",
    },
    type: 200,
  },
  "0vojjvJ6rP": {
    data: {
      val: "food",
      text: "food",
    },
    type: 200,
  },
  "2PT6bTPTqj": {
    data: {
      fn: "item",
      text: "contains",
    },
    type: 100,
    edges: ["oB2vfxQs4D", "ykhO0drpaY", "U9S73zxy9n", "LwozLZdXCA"],
  },
  "3H2bGdzpIN": {
    data: {
      fn: "item",
      text: "Does the basket contain apples?",
    },
    type: 100,
    edges: ["BJpKurp49I", "hKebzlFQDa"],
  },
  "4JPWSgnGtI": {
    data: {
      val: "tool",
      text: "tools",
    },
    type: 200,
  },
  "52ZNXBMLDP": {
    data: {
      color: "#EFEFEF",
      title: "?, so must be a 🍌 or 🔧",
      resetButton: false,
    },
    type: 8,
  },
  "6RR1J1lmrM": {
    data: {
      color: "#EFEFEF",
      title: "🍏",
      resetButton: false,
    },
    type: 8,
  },
  "7tV1uvR9ng": {
    data: {
      val: "tool.spanner",
      text: "spanner",
    },
    type: 200,
  },
  AFX3QwbOCd: {
    data: {
      fn: "item",
      text: "Which does the basket contain?",
    },
    type: 100,
    edges: ["4JPWSgnGtI", "0vojjvJ6rP"],
  },
  BJpKurp49I: {
    data: {
      val: "food.fruit.apple",
      text: "Yes",
    },
    type: 200,
  },
  BloOMLvLJK: {
    data: {
      val: "food.fruit.banana",
      text: "banana",
    },
    type: 200,
  },
  EqfqaqZ6CH: {
    data: {
      val: "food.fruit.apple",
      text: "apple",
    },
    type: 200,
  },
  HV0gV8DOil: {
    data: {
      fn: "item",
      text: "shopping trolley",
      allRequired: false,
    },
    type: 105,
    edges: ["lTosE7Xo1j", "BloOMLvLJK", "0LzMSk4JTO", "OvNhSiRfdL"],
  },
  I8DznYCKVg: {
    data: {
      val: "food.fruit.banana",
      text: "banana",
    },
    type: 200,
  },
  Imks7j68BD: {
    data: {
      fn: "item",
      text: "shopping trolley",
      allRequired: false,
    },
    type: 105,
    edges: ["EqfqaqZ6CH", "I8DznYCKVg", "pXFKKRG6lE", "7tV1uvR9ng"],
  },
  LwozLZdXCA: {
    data: {
      text: "neither apples nor bread",
    },
    type: 200,
    edges: ["52ZNXBMLDP"],
  },
  OvNhSiRfdL: {
    data: {
      val: "tool.spanner",
      text: "spanner",
    },
    type: 200,
  },
  U9S73zxy9n: {
    data: {
      val: "food.fruit.apple,food.bread",
      text: "apples and bread",
    },
    type: 200,
    edges: ["t3SCqQKeUK"],
  },
  g0IAKsBVPQ: {
    data: {
      color: "#EFEFEF",
      title: "🥖",
      resetButton: false,
    },
    type: 8,
  },
  hKebzlFQDa: {
    data: {
      text: "No",
    },
    type: 200,
  },
  lTosE7Xo1j: {
    data: {
      val: "food.fruit.apple",
      text: "apple",
    },
    type: 200,
  },
  oB2vfxQs4D: {
    data: {
      val: "food.fruit.apple",
      text: "apples",
    },
    type: 200,
    edges: ["6RR1J1lmrM"],
  },
  pXFKKRG6lE: {
    data: {
      val: "food.bread",
      text: "bread",
    },
    type: 200,
  },
  t3SCqQKeUK: {
    data: {
      color: "#EFEFEF",
      title: "🍏🥖",
      resetButton: false,
    },
    type: 8,
  },
  ykhO0drpaY: {
    data: {
      val: "food.bread",
      text: "bread",
    },
    type: 200,
    edges: ["g0IAKsBVPQ"],
  },
};

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

test("one", () => {
  setState({
    flow,
  });

  expect(getState().upcomingCardIds()).toEqual([
    "Imks7j68BD",
    "HV0gV8DOil",
    "2PT6bTPTqj",
    "3H2bGdzpIN",
    "AFX3QwbOCd",
  ]);

  // record apple
  getState().record("Imks7j68BD", ["EqfqaqZ6CH"]);

  expect(getState().upcomingCardIds()).toEqual(["6RR1J1lmrM"]);
});

test("two", () => {
  setState({
    flow,
  });

  expect(getState().upcomingCardIds()).toEqual([
    "Imks7j68BD",
    "HV0gV8DOil",
    "2PT6bTPTqj",
    "3H2bGdzpIN",
    "AFX3QwbOCd",
  ]);

  // record apple and bread
  getState().record("Imks7j68BD", ["EqfqaqZ6CH", "pXFKKRG6lE"]);

  expect(getState().upcomingCardIds()).toEqual(["t3SCqQKeUK"]);
});
