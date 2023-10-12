import { TYPES } from "@planx/components/types";

import { Store, vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

const flow: Store.flow = {
  _root: {
    edges: ["SetValue", "Content", "AutomatedQuestion"],
  },
  ResponseApple: {
    data: {
      val: "apple",
      text: "Apple",
    },
    type: TYPES.Response,
  },
  ResponsePear: {
    data: {
      val: "pear",
      text: "Pear",
    },
    type: TYPES.Response,
  },
  SetValue: {
    data: {
      fn: "fruit",
      val: "apple",
    },
    type: TYPES.SetValue,
  },
  AutomatedQuestion: {
    data: {
      fn: "fruit",
      text: "Which fruit?",
    },
    type: TYPES.Statement,
    edges: ["ResponseApple", "ResponsePear"],
  },
  Content: {
    data: {
      content: "<p>Pause</p>",
    },
    type: TYPES.Content,
  },
};

beforeEach(() => {
  getState().resetPreview();
});

test.skip("A question is auto-answered when it is reached, not when its' `fn` is first added to the breadcrumbs/passport", () => {
  setState({
    flow,
  });

  expect(getState().upcomingCardIds()).toEqual([
    "SetValue",
    "Content",
    "AutomatedQuestion",
  ]);

  // One step forwards
  getState().record("SetValue", { data: { fruit: ["apple"] }, auto: true });
  expect(getState().breadcrumbs).toMatchObject({
    SetValue: {
      auto: true,
      data: {
        fruit: ["apple"],
      },
    },
  });

  // "AutomatedQuestion" should still be queued up, not already answered
  expect(getState().upcomingCardIds()).toEqual([
    "Content",
    "AutomatedQuestion",
  ]);
});
