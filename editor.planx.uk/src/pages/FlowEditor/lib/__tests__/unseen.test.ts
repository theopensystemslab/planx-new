import { Store, useStore } from "../store";

const { getState, setState } = useStore;

// https://github.com/theopensystemslab/planx-new/pull/430#issue-625111571
const flow: Store.Flow = {
  _root: {
    edges: ["Dq7qLvn9If", "GZAmDGuV3J"],
  },
  Dq7qLvn9If: {
    type: 100,
    data: {
      fn: "test",
      text: "first",
    },
    edges: ["to4BQeRpOn", "6CTQDoPZPQ", "gxrGcPJCqi"],
  },
  to4BQeRpOn: {
    type: 200,
    data: {
      text: "1",
      val: "1",
    },
  },
  "6CTQDoPZPQ": {
    type: 200,
    data: {
      text: "2",
      val: "2",
    },
  },
  GZAmDGuV3J: {
    type: 100,
    data: {
      fn: "test",
      text: "second",
    },
    edges: ["R4N2rp5nXt", "tX0BQy3QcA"],
  },
  R4N2rp5nXt: {
    type: 200,
    data: {
      text: "1",
      val: "1",
    },
  },
  tX0BQy3QcA: {
    type: 200,
    data: {
      text: "empty",
    },
    edges: ["pws2AF5whV"],
  },
  gxrGcPJCqi: {
    type: 200,
    data: {
      text: "empty",
    },
  },
  pws2AF5whV: {
    type: 100,
    data: {
      fn: "test",
      text: "inner",
    },
    edges: ["aH3SQ3Agsi", "WRSytUiGsr"],
  },
  aH3SQ3Agsi: {
    type: 200,
    data: {
      text: "1",
      val: "1",
    },
  },
  WRSytUiGsr: {
    type: 200,
    data: {
      text: "unseen",
      val: "unseen",
    },
  },
};

it("always shows a question when has a response(value) that hasn't been seen before", () => {
  setState({ flow });
  getState().record("Dq7qLvn9If", { answers: ["6CTQDoPZPQ"] });
  expect(getState().upcomingCardIds()).toEqual(["pws2AF5whV"]);
});
