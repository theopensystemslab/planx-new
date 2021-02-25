import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

const flow = {
  _root: {
    edges: ["P36QH99kvZ", "uYvBtZO8AN"],
  },
  uYvBtZO8AN: {
    type: 105,
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
    type: 200,
    edges: ["J1u7Gpf8S1", "vR40DW4oAn", "mNzbrbhCsT"],
  },
  "9wMrjIHzW4": {
    data: {
      text: "banana",
      val: "food.fruit.banana",
    },
    type: 200,
  },
  vR40DW4oAn: {
    type: 100,
    data: {
      text: "did you choose the banana?",
      fn: "item",
    },
    edges: ["y9sfwmwRG3", "ojPenHnK0K"],
  },
  y9sfwmwRG3: {
    type: 200,
    data: {
      text: "yes",
      val: "food.fruit.banana",
    },
  },
  ojPenHnK0K: {
    type: 200,
    data: {
      text: "no",
    },
    edges: ["bpbEbD6fHo"],
  },
  mNzbrbhCsT: {
    type: 250,
    data: {
      content: "<p>last thing</p>\n",
    },
  },
  bpbEbD6fHo: {
    type: 100,
    data: {
      text: "will you be eating the banana today?",
    },
    edges: ["jUDIdyRnl3", "gDIoLjLoFW"],
  },
  jUDIdyRnl3: {
    type: 200,
    data: {
      text: "yes",
    },
  },
  gDIoLjLoFW: {
    type: 200,
    data: {
      text: "no",
    },
  },
  J1u7Gpf8S1: {
    type: 100,
    data: {
      text: "you chose apple",
    },
    edges: ["ij94v25xVZ"],
  },
  ij94v25xVZ: {
    type: 200,
    data: {
      text: "i did",
    },
  },
  P36QH99kvZ: {
    type: 100,
    data: {
      fn: "item",
      text: "shopping trolley 1",
    },
    edges: ["TMRY4IGTwG", "3dCm8g4wBY"],
  },
  TMRY4IGTwG: {
    type: 200,
    data: {
      text: "apple",
      val: "food.fruit.apple",
    },
  },
  "3dCm8g4wBY": {
    type: 200,
    data: {
      text: "banana",
      val: "food.fruit.banana",
    },
  },
};

// fs.writeFileSync("out.dot", toDot(flow));

beforeEach(() => {
  getState().resetPreview();
});

test.only("order", () => {
  setState({
    flow,
  });

  // console.log(getState().dfs());

  // getState().record("Imks7j68BD", ["EqfqaqZ6CH", "7tV1uvR9ng"]);
  getState().upcomingCardIds();
  expect(getState().upcomingCardIds()).toEqual(["P36QH99kvZ", "uYvBtZO8AN"]);
  getState().record("P36QH99kvZ", ["TMRY4IGTwG"]);
  getState().upcomingCardIds();
  expect(getState().upcomingCardIds()).toEqual([
    "J1u7Gpf8S1",
    "bpbEbD6fHo",
    "mNzbrbhCsT",
  ]);
  getState().record("J1u7Gpf8S1", ["ij94v25xVZ"]); // you chose apple - i did
  getState().upcomingCardIds();
  expect(getState().upcomingCardIds()).toEqual(["bpbEbD6fHo", "mNzbrbhCsT"]);
  expect(getState().breadcrumbs).toEqual({
    J1u7Gpf8S1: { answers: ["ij94v25xVZ"], auto: false },
    P36QH99kvZ: { answers: ["TMRY4IGTwG"], auto: false },
    uYvBtZO8AN: { answers: ["6J02AGJpgH"], auto: true },
    vR40DW4oAn: { answers: ["ojPenHnK0K"], auto: true },
  });
});
