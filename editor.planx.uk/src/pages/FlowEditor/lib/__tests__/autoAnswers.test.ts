import { TYPES } from "@planx/components/types";

import { Store, vanillaStore } from "../store";

const { getState, setState } = vanillaStore;
const { upcomingCardIds, resetPreview, record, currentCard } = getState();

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
  resetPreview();
  setState({ flow });
});

test.skip("A question is auto-answered when it is reached, not when its' `fn` is first added to the breadcrumbs/passport", () => {
  const visitedNodes = () => Object.keys(getState().breadcrumbs);

  // mimic "Continue" button and properly set visitedNodes()
  const clickContinue = () => upcomingCardIds();

  expect(upcomingCardIds()).toEqual([
    "SetValue",
    "Content",
    "AutomatedQuestion",
  ]);

  // Step forwards through the SetValue
  record("SetValue", { data: { fruit: ["apple"] }, auto: true });
  clickContinue();

  expect(currentCard()?.id).toBe("Content");

  // "AutomatedQuestion" should still be queued up, not already answered based on SetValue
  expect(visitedNodes()).not.toContain("AutomatedQuestion");
  expect(upcomingCardIds()).toContain("AutomatedQuestion");

  // Step forwards through Content
  record("Content", { data: {}, auto: false });
  clickContinue();

  // "AutomatedQuestion" has now been auto-answered now, end of flow
  expect(visitedNodes()).toContain("AutomatedQuestion");
  expect(upcomingCardIds()).toEqual([]);
});
