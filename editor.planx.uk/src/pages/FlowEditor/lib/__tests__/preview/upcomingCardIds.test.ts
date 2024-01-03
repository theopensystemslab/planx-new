import { TYPES } from "@planx/components/types";

import { Store, vanillaStore } from "../../store";

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

test("The first _root edge is immediately queued up", () => {
  expect(upcomingCardIds()).toEqual(["SetValue"]);
});

test("A node is only auto-answered when it is the first upcomingCardId(), not when its' `fn` is first added to the breadcrumbs/passport", () => {
  const visitedNodes = () => Object.keys(getState().breadcrumbs);

  // mimic "Continue" button and properly set visitedNodes()
  const clickContinue = () => upcomingCardIds();

  expect(upcomingCardIds()).toEqual(["SetValue"]);

  // Step forwards through the SetValue
  record("SetValue", { data: { fruit: ["apple"] }, auto: true });
  clickContinue();

  expect(currentCard()?.id).toBe("Content");

  // "AutomatedQuestion" should still be queued up, not already answered based on SetValue
  expect(visitedNodes()).not.toContain("AutomatedQuestion");
  // expect(upcomingCardIds()).toContain("AutomatedQuestion");

  // Step forwards through Content
  record("Content", { data: {}, auto: false });
  clickContinue();

  // "AutomatedQuestion" has now been auto-answered now, end of flow
  expect(visitedNodes()).toContain("AutomatedQuestion");
  expect(upcomingCardIds()).toEqual([]);
});

test("it lists upcoming cards", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Statement,
        edges: ["c"],
      },
      b: {
        type: TYPES.Statement,
      },
      c: {
        type: TYPES.Response,
        edges: ["d"],
      },
      d: {
        type: TYPES.Statement,
        edges: ["e", "f"],
      },
      e: { type: TYPES.Response },
      f: { type: TYPES.Response },
    },
  });

  expect(upcomingCardIds()).toEqual(["a"]);

  record("a", { answers: ["c"] });

  expect(upcomingCardIds()).toEqual(["d"]);

  record("d", { answers: ["e", "f"] });

  expect(upcomingCardIds()).toEqual([]);
});

test("crawling with portals", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.InternalPortal,
        edges: ["c"],
      },
      b: {
        edges: ["d"],
      },
      c: {
        edges: ["d"],
      },
      d: {},
    },
  });

  expect(upcomingCardIds()).toEqual(["c"]);
});
