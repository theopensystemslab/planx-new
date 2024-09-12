import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { Store, useStore } from "../store";

const { getState, setState } = useStore;

const flow: Store.Flow = {
  _root: {
    edges: ["QuestionTrolley", "ChecklistTrolley"],
  },
  ChecklistTrolley: {
    type: TYPES.Checklist,
    data: {
      allRequired: false,
      text: "shopping trolley 2",
      fn: "item",
    },
    edges: ["AppleChecklistResponse", "BananaChecklistResponse"],
  },
  AppleChecklistResponse: {
    data: {
      text: "apple",
      val: "food.fruit.apple",
    },
    type: TYPES.Answer,
    edges: [
      "AppleQuestionWithoutFn",
      "AutoAnsweredBananaQuestion",
      "FinalContent",
    ],
  },
  BananaChecklistResponse: {
    data: {
      text: "banana",
      val: "food.fruit.banana",
    },
    type: TYPES.Answer,
  },
  AutoAnsweredBananaQuestion: {
    type: TYPES.Question,
    data: {
      text: "did you choose the banana?",
      fn: "item",
    },
    edges: ["YesBanana", "NoBanana"],
  },
  YesBanana: {
    type: TYPES.Answer,
    data: {
      text: "yes",
      val: "food.fruit.banana",
    },
  },
  NoBanana: {
    type: TYPES.Answer,
    data: {
      text: "no",
    },
    edges: ["BananaQuestionWithoutFn"],
  },
  FinalContent: {
    type: TYPES.Content,
    data: {
      content: "<p>last thing</p>\n",
    },
  },
  BananaQuestionWithoutFn: {
    type: TYPES.Question,
    data: {
      text: "will you be eating the banana today?",
    },
    edges: ["YesEatingBanana", "NoEatingBanana"],
  },
  YesEatingBanana: {
    type: TYPES.Answer,
    data: {
      text: "yes",
    },
  },
  NoEatingBanana: {
    type: TYPES.Answer,
    data: {
      text: "no",
    },
  },
  AppleQuestionWithoutFn: {
    type: TYPES.Question,
    data: {
      text: "you chose apple",
    },
    edges: ["YesApple"],
  },
  YesApple: {
    type: TYPES.Answer,
    data: {
      text: "i did",
    },
  },
  QuestionTrolley: {
    type: TYPES.Question,
    data: {
      fn: "item",
      text: "shopping trolley 1",
    },
    edges: ["AppleQuestionResponse", "BananaQuestionResponse"],
  },
  AppleQuestionResponse: {
    type: TYPES.Answer,
    data: {
      text: "apple",
      val: "food.fruit.apple",
    },
  },
  BananaQuestionResponse: {
    type: TYPES.Answer,
    data: {
      text: "banana",
      val: "food.fruit.banana",
    },
  },
};

beforeEach(() => {
  getState().resetPreview();
});

test("Nodes are asked in the expected order", () => {
  setState({
    flow,
  });

  // Root nodes are immediately queued up in upcomingCardIds()
  expect(getState().upcomingCardIds()).toEqual([
    "QuestionTrolley",
    "ChecklistTrolley",
  ]);

  // Proceed through first Question and answer "Apple"
  getState().record("QuestionTrolley", { answers: ["AppleQuestionResponse"] });
  getState().upcomingCardIds(); // mimic "Continue"

  // New upcoming cards
  expect(getState().upcomingCardIds()).toEqual([
    "AppleQuestionWithoutFn",
    "BananaQuestionWithoutFn",
    "FinalContent",
  ]);

  // Two nodes have been auto-answered based on Question response
  expect(getState().breadcrumbs).toEqual({
    AutoAnsweredBananaQuestion: { answers: ["NoBanana"], auto: true },
    ChecklistTrolley: { answers: ["AppleChecklistResponse"], auto: true },
    QuestionTrolley: { answers: ["AppleQuestionResponse"], auto: false },
  });

  // Manually answer a branched Question
  getState().record("AppleQuestionWithoutFn", { answers: ["YesApple"] });
  getState().upcomingCardIds();

  // Updated upcoming cards
  expect(getState().upcomingCardIds()).toEqual([
    "BananaQuestionWithoutFn",
    "FinalContent",
  ]);

  // Updated breadcrumbs
  expect(getState().breadcrumbs).toEqual({
    AppleQuestionWithoutFn: { answers: ["YesApple"], auto: false },
    QuestionTrolley: { answers: ["AppleQuestionResponse"], auto: false },
    ChecklistTrolley: { answers: ["AppleChecklistResponse"], auto: true },
    AutoAnsweredBananaQuestion: { answers: ["NoBanana"], auto: true },
  });
});
