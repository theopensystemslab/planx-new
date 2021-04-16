import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

const flow = {
  _root: {
    edges: ["P36QH99kvZ", "uYvBtZO8AN"],
  },
  uYvBtZO8AN: {
    type: TYPES.Checklist,
    data: {
      allRequired: false,
      text: "shopping trolley 2",
      fn: "item",
    },
    edges: ["6J02AGJpgH", "9wMrjIHzW4"],
  },
  "6J02AGJpgH": {
    data: {
      text: "apple",
      val: "food.fruit.apple",
    },
    type: TYPES.Response,
    edges: ["J1u7Gpf8S1", "vR40DW4oAn", "mNzbrbhCsT"],
  },
  "9wMrjIHzW4": {
    data: {
      text: "banana",
      val: "food.fruit.banana",
    },
    type: TYPES.Response,
  },
  vR40DW4oAn: {
    type: TYPES.Statement,
    data: {
      text: "did you choose the banana?",
      fn: "item",
    },
    edges: ["y9sfwmwRG3", "ojPenHnK0K"],
  },
  y9sfwmwRG3: {
    type: TYPES.Response,
    data: {
      text: "yes",
      val: "food.fruit.banana",
    },
  },
  ojPenHnK0K: {
    type: TYPES.Response,
    data: {
      text: "no",
    },
    edges: ["bpbEbD6fHo"],
  },
  mNzbrbhCsT: {
    type: TYPES.Content,
    data: {
      content: "<p>last thing</p>\n",
    },
  },
  bpbEbD6fHo: {
    type: TYPES.Statement,
    data: {
      text: "will you be eating the banana today?",
    },
    edges: ["jUDIdyRnl3", "gDIoLjLoFW"],
  },
  jUDIdyRnl3: {
    type: TYPES.Response,
    data: {
      text: "yes",
    },
  },
  gDIoLjLoFW: {
    type: TYPES.Response,
    data: {
      text: "no",
    },
  },
  J1u7Gpf8S1: {
    type: TYPES.Statement,
    data: {
      text: "you chose apple",
    },
    edges: ["ij94v25xVZ"],
  },
  ij94v25xVZ: {
    type: TYPES.Response,
    data: {
      text: "i did",
    },
  },
  P36QH99kvZ: {
    type: TYPES.Statement,
    data: {
      fn: "item",
      text: "shopping trolley 1",
    },
    edges: ["TMRY4IGTwG", "3dCm8g4wBY"],
  },
  TMRY4IGTwG: {
    type: TYPES.Response,
    data: {
      text: "apple",
      val: "food.fruit.apple",
    },
  },
  "3dCm8g4wBY": {
    type: TYPES.Response,
    data: {
      text: "banana",
      val: "food.fruit.banana",
    },
  },
};

beforeEach(() => {
  getState().resetPreview();
});

test("order", () => {
  setState({
    flow,
  });

  expect(getState().upcomingCardIds()).toEqual(["P36QH99kvZ", "uYvBtZO8AN"]);
  getState().record("P36QH99kvZ", { answers: ["TMRY4IGTwG"] });
  expect(getState().upcomingCardIds()).toEqual([
    "J1u7Gpf8S1",
    "bpbEbD6fHo",
    "mNzbrbhCsT",
  ]);
  getState().record("J1u7Gpf8S1", { answers: ["ij94v25xVZ"] }); // you chose apple - i did
  expect(getState().upcomingCardIds()).toEqual(["bpbEbD6fHo", "mNzbrbhCsT"]);
  expect(getState().breadcrumbs).toEqual({
    J1u7Gpf8S1: { answers: ["ij94v25xVZ"], auto: false },
    P36QH99kvZ: { answers: ["TMRY4IGTwG"], auto: false },
    uYvBtZO8AN: { answers: ["6J02AGJpgH"], auto: true },
    vR40DW4oAn: { answers: ["ojPenHnK0K"], auto: true },
  });
});
