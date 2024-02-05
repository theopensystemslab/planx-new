import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

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
    type: TYPES.Answer,
  },
  ResponsePear: {
    data: {
      val: "pear",
      text: "Pear",
    },
    type: TYPES.Answer,
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
    type: TYPES.Question,
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

test("Root nodes are immediately queued up", () => {
  expect(upcomingCardIds()).toEqual([
    "SetValue",
    "Content",
    "AutomatedQuestion",
  ]);
});

test.skip("A node is only auto-answered when it is the first upcomingCardId(), not when its' `fn` is first added to the breadcrumbs/passport", () => {
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

test("it lists upcoming cards", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Question,
        edges: ["c"],
      },
      b: {
        type: TYPES.Question,
      },
      c: {
        type: TYPES.Answer,
        edges: ["d"],
      },
      d: {
        type: TYPES.Question,
        edges: ["e", "f"],
      },
      e: { type: TYPES.Answer },
      f: { type: TYPES.Answer },
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

  expect(upcomingCardIds()).toEqual(["c", "b"]);
});
