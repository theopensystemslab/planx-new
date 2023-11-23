import { TYPES } from "@planx/components/types";
import { Store, vanillaStore } from "pages/FlowEditor/lib/store";

const { getState, setState } = vanillaStore;
const { upcomingCardIds, resetPreview, record, currentCard } = getState();

// Helper method
const visitedNodes = () => Object.keys(getState().breadcrumbs);

beforeEach(() => {
  resetPreview();
});

test("When formatOutputForAutomations is true, Calculate writes an array and future questions are auto-answered", () => {
  // Setup
  setState({ flow: flowWithAutomation });
  expect(upcomingCardIds()).toEqual([
    "Calculate",
    "Question",
  ]);

  // Step forwards through the Calculate
  record("Calculate", { data: { testGroup: ["2"] }, auto: true });
  upcomingCardIds();

  // The Question has been auto-answered
  expect(visitedNodes()).toEqual([
    "Calculate",
    "Question",
  ]);

  expect(upcomingCardIds()).toEqual([
    "Group2Notice",
  ]);
});

test("When formatOutputForAutomations is false, Calculate writes a number and future questions are not auto-answered", () => {
  // Setup
  setState({ flow: flowWithoutAutomation });
  expect(upcomingCardIds()).toEqual([
    "Calculate",
    "Question",
  ]);

  // Step forwards through the Calculate
  record("Calculate", { data: { testGroup: 2 }, auto: true });
  upcomingCardIds();

  // The Question has NOT been auto-answered
  expect(visitedNodes()).toEqual([
    "Calculate",
  ]);

  expect(upcomingCardIds()).toEqual([
    "Question"
  ]);
});

const flowWithAutomation: Store.flow = {
  "_root": {
    "edges": [
      "Calculate",
      "Question"
    ]
  },
  "Group2Notice": {
    "data": {
      "color": "#EFEFEF",
      "title": "You are Group 2",
      "resetButton": false
    },
    "type": TYPES.Notice
  },
  "Calculate": {
    "data": {
      "output": "testGroup",
      "formula": "pickRandom([1,2])",
      "formatOutputForAutomations": true
    },
    "type": TYPES.Calculate
  },
  "Group1Notice": {
    "data": {
      "color": "#EFEFEF",
      "title": "You are Group 1",
      "resetButton": false
    },
    "type": TYPES.Notice
  },
  "Group1Response": {
    "data": {
      "val": "1",
      "text": "1"
    },
    "type": TYPES.Response,
    "edges": [
      "Group1Notice"
    ]
  },
  "Question": {
    "data": {
      "fn": "testGroup",
      "text": "Which test group? "
    },
    "type": TYPES.Statement,
    "edges": [
      "Group1Response",
      "Group2Response"
    ]
  },
  "Group2Response": {
    "data": {
      "val": "2",
      "text": "2"
    },
    "type": TYPES.Response,
    "edges": [
      "Group2Notice"
    ]
  }
};

const flowWithoutAutomation: Store.flow = {
  "_root": {
    "edges": [
      "Calculate",
      "Question"
    ]
  },
  "Group2Notice": {
    "data": {
      "color": "#EFEFEF",
      "title": "You are Group 2",
      "resetButton": false
    },
    "type": TYPES.Notice
  },
  "Calculate": {
    "data": {
      "output": "testGroup",
      "formula": "pickRandom([1,2])",
      "formatOutputForAutomations": false
    },
    "type": TYPES.Calculate
  },
  "Group1Notice": {
    "data": {
      "color": "#EFEFEF",
      "title": "You are Group 1",
      "resetButton": false
    },
    "type": TYPES.Notice
  },
  "Group1Response": {
    "data": {
      "val": "1",
      "text": "1"
    },
    "type": TYPES.Response,
    "edges": [
      "Group1Notice"
    ]
  },
  "Question": {
    "data": {
      "fn": "testGroup",
      "text": "Which test group? "
    },
    "type": TYPES.Statement,
    "edges": [
      "Group1Response",
      "Group2Response"
    ]
  },
  "Group2Response": {
    "data": {
      "val": "2",
      "text": "2"
    },
    "type": TYPES.Response,
    "edges": [
      "Group2Notice"
    ]
  }
};
