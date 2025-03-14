import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import {
  clickContinue,
  visitedNodes,
} from "pages/FlowEditor/lib/__tests__/utils";
import { Store, useStore } from "pages/FlowEditor/lib/store";

const { getState, setState } = useStore;
const { upcomingCardIds, resetPreview, autoAnswerableOptions } = getState();

beforeEach(() => {
  resetPreview();
});

test("When formatOutputForAutomations is true, Calculate writes an array and future questions are auto-answered", () => {
  // Setup
  setState({ flow: flowWithAutomation });
  expect(upcomingCardIds()).toEqual(["Calculate", "Question"]);

  // Step forwards through the Calculate
  clickContinue("Calculate", { data: { testGroup: ["2"] }, auto: true });

  // The Question can be auto-answered
  expect(visitedNodes()).toEqual(["Calculate"]);
  expect(upcomingCardIds()).toEqual(["Question"]);
  expect(autoAnswerableOptions("Question")).toEqual(["Group2Response"]);
});

test("When formatOutputForAutomations is false, Calculate writes a number and future questions are not auto-answered", () => {
  // Setup
  setState({ flow: flowWithoutAutomation });
  expect(upcomingCardIds()).toEqual(["Calculate", "Question"]);

  // Step forwards through the Calculate
  clickContinue("Calculate", { data: { testGroup: 2 }, auto: true });

  // The Question cannot be auto-answered
  expect(visitedNodes()).toEqual(["Calculate"]);
  expect(upcomingCardIds()).toEqual(["Question"]);
  expect(autoAnswerableOptions("Question")).toBeUndefined();
});

const flowWithAutomation: Store.Flow = {
  _root: {
    edges: ["Calculate", "Question"],
  },
  Group2Notice: {
    data: {
      color: "#EFEFEF",
      title: "You are Group 2",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  Calculate: {
    data: {
      fn: "testGroup",
      formula: "pickRandom([1,2])",
      formatOutputForAutomations: true,
    },
    type: TYPES.Calculate,
  },
  Group1Notice: {
    data: {
      color: "#EFEFEF",
      title: "You are Group 1",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  Group1Response: {
    data: {
      val: "1",
      text: "1",
    },
    type: TYPES.Answer,
    edges: ["Group1Notice"],
  },
  Question: {
    data: {
      fn: "testGroup",
      text: "Which test group? ",
    },
    type: TYPES.Question,
    edges: ["Group1Response", "Group2Response"],
  },
  Group2Response: {
    data: {
      val: "2",
      text: "2",
    },
    type: TYPES.Answer,
    edges: ["Group2Notice"],
  },
};

const flowWithoutAutomation: Store.Flow = {
  _root: {
    edges: ["Calculate", "Question"],
  },
  Group2Notice: {
    data: {
      color: "#EFEFEF",
      title: "You are Group 2",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  Calculate: {
    data: {
      fn: "testGroup",
      formula: "pickRandom([1,2])",
      formatOutputForAutomations: false,
    },
    type: TYPES.Calculate,
  },
  Group1Notice: {
    data: {
      color: "#EFEFEF",
      title: "You are Group 1",
      resetButton: false,
    },
    type: TYPES.Notice,
  },
  Group1Response: {
    data: {
      val: "1",
      text: "1",
    },
    type: TYPES.Answer,
    edges: ["Group1Notice"],
  },
  Question: {
    data: {
      fn: "testGroup",
      text: "Which test group? ",
    },
    type: TYPES.Question,
    edges: ["Group1Response", "Group2Response"],
  },
  Group2Response: {
    data: {
      val: "2",
      text: "2",
    },
    type: TYPES.Answer,
    edges: ["Group2Notice"],
  },
};
