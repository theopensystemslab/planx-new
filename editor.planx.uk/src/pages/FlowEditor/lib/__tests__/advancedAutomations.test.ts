import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { Store, vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

const flow: Store.flow = {
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
    type: TYPES.Answer,
  },
  "0vojjvJ6rP": {
    data: {
      val: "food",
      text: "food",
    },
    type: TYPES.Answer,
    edges: ["mOPogpQa7V"],
  },
  "2PT6bTPTqj": {
    data: {
      fn: "item",
      text: "contains",
    },
    type: TYPES.Question,
    edges: ["oB2vfxQs4D", "ykhO0drpaY", "U9S73zxy9n", "LwozLZdXCA"],
  },
  "3H2bGdzpIN": {
    data: {
      fn: "item",
      text: "Does the basket contain apples?",
    },
    type: TYPES.Question,
    edges: ["BJpKurp49I", "hKebzlFQDa"],
  },
  "4JPWSgnGtI": {
    data: {
      val: "tool",
      text: "tools",
    },
    type: TYPES.Answer,
    edges: ["KcLGMm3UWw"],
  },
  "52ZNXBMLDP": {
    data: {
      color: "#EFEFEF",
      title: "?, so must be a 🍌 or 🔧",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  "6RR1J1lmrM": {
    data: {
      color: "#EFEFEF",
      title: "🍏",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  "7tV1uvR9ng": {
    data: {
      val: "tool.spanner",
      text: "spanner",
    },
    type: TYPES.Answer,
  },
  AFX3QwbOCd: {
    data: {
      fn: "item",
      text: "Which does the basket contain?",
    },
    type: TYPES.Question,
    edges: ["4JPWSgnGtI", "0vojjvJ6rP"],
  },
  BJpKurp49I: {
    data: {
      val: "food.fruit.apple",
      text: "Yes",
    },
    type: TYPES.Answer,
  },
  BloOMLvLJK: {
    data: {
      val: "food.fruit.banana",
      text: "banana",
    },
    type: TYPES.Answer,
  },
  EqfqaqZ6CH: {
    data: {
      val: "food.fruit.apple",
      text: "apple",
    },
    type: TYPES.Answer,
  },
  HV0gV8DOil: {
    data: {
      fn: "item",
      text: "shopping trolley (should be skipped)",
      allRequired: false,
    },
    type: TYPES.Checklist,
    edges: ["lTosE7Xo1j", "BloOMLvLJK", "0LzMSk4JTO", "OvNhSiRfdL"],
  },
  I8DznYCKVg: {
    data: {
      val: "food.fruit.banana",
      text: "banana",
    },
    type: TYPES.Answer,
  },
  Imks7j68BD: {
    data: {
      fn: "item",
      text: "shopping trolley",
      allRequired: false,
    },
    type: TYPES.Checklist,
    edges: ["EqfqaqZ6CH", "I8DznYCKVg", "pXFKKRG6lE", "7tV1uvR9ng"],
  },
  KcLGMm3UWw: {
    data: {
      color: "#EFEFEF",
      title: "🔧",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  LwozLZdXCA: {
    data: {
      text: "neither apples nor bread",
    },
    type: TYPES.Answer,
    edges: ["52ZNXBMLDP"],
  },
  OvNhSiRfdL: {
    data: {
      val: "tool.spanner",
      text: "spanner",
    },
    type: TYPES.Answer,
  },
  U9S73zxy9n: {
    data: {
      val: "food.fruit.apple,food.bread",
      text: "apples and bread",
    },
    type: TYPES.Answer,
    edges: ["t3SCqQKeUK"],
  },
  g0IAKsBVPQ: {
    data: {
      color: "#EFEFEF",
      title: "🥖",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  hKebzlFQDa: {
    data: {
      text: "No",
    },
    type: TYPES.Answer,
  },
  lTosE7Xo1j: {
    data: {
      val: "food.fruit.apple",
      text: "apple",
    },
    type: TYPES.Answer,
  },
  mOPogpQa7V: {
    data: {
      color: "#EFEFEF",
      title: "🍌🍏🥖",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  oB2vfxQs4D: {
    data: {
      val: "food.fruit.apple",
      text: "apples",
    },
    type: TYPES.Answer,
    edges: ["6RR1J1lmrM"],
  },
  pXFKKRG6lE: {
    data: {
      val: "food.bread",
      text: "bread",
    },
    type: TYPES.Answer,
  },
  t3SCqQKeUK: {
    data: {
      color: "#EFEFEF",
      title: "🍏🥖",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  ykhO0drpaY: {
    data: {
      val: "food.bread",
      text: "bread",
    },
    type: TYPES.Answer,
    edges: ["g0IAKsBVPQ"],
  },
};

beforeEach(() => {
  getState().resetPreview();
});

test("apple", () => {
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
  getState().record("Imks7j68BD", { answers: ["EqfqaqZ6CH"] });

  expect(getState().upcomingCardIds()).toEqual(["6RR1J1lmrM", "mOPogpQa7V"]);
});

test("apple and spanner", () => {
  setState({
    flow,
  });

  // record apple and spanner
  getState().record("Imks7j68BD", { answers: ["EqfqaqZ6CH", "7tV1uvR9ng"] });

  expect(getState().upcomingCardIds()).toEqual(["6RR1J1lmrM", "KcLGMm3UWw"]);
});

test("apple and bread", () => {
  setState({
    flow,
  });

  // record apple and bread
  getState().record("Imks7j68BD", { answers: ["EqfqaqZ6CH", "pXFKKRG6lE"] });

  expect(getState().upcomingCardIds()).toEqual(["t3SCqQKeUK", "mOPogpQa7V"]);
});
