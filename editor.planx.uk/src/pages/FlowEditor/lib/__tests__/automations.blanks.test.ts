import { Store, useStore } from "../store";
import { clickContinue } from "./utils";

const { getState, setState } = useStore;
const { resetPreview, upcomingCardIds, autoAnswerableOptions, computePassport } = getState();

describe("Auto-answering blanks", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow });
  });

  test("Checklists with the same options auto-answer the blank", () => {
    // Manually select the test path 
    expect(upcomingCardIds()).toEqual(["TestPathSelection"]);
    clickContinue("TestPathSelection", { answers: ["TestPath1"], auto: false });

    // Manually proceed through the first blank
    expect(upcomingCardIds()).toEqual(["Path1Checklist1", "Path1Checklist2"]);
    clickContinue("Path1Checklist1", { answers: ["Path1Checklist1Blank"], auto: false });

    // The second blank is auto-answered because we do not have a passport value but we've seen all options before
    expect(computePassport()?.data).not.toHaveProperty("option");
    expect(autoAnswerableOptions("Path1Checklist2")).toEqual(["Path1Checklist2Blank"]);
  });

  test("Checklists with different options do not auto-answer the blank", () => {
    // Manually select the test path 
    expect(upcomingCardIds()).toEqual(["TestPathSelection"]);
    clickContinue("TestPathSelection", { answers: ["TestPath2"], auto: false });

    // Manually proceed through the first blank
    expect(upcomingCardIds()).toEqual(["Path2Checklist1", "Path2Checklist2"]);
    clickContinue("Path2Checklist1", { answers: ["Path2Checklist1Blank"], auto: false });

    // The second blank is put to the user because we do not have a passport value and we have NOT seen all options before
    expect(computePassport()?.data).not.toHaveProperty("option");
    expect(autoAnswerableOptions("Path2Checklist2")).toBeUndefined;
  });

  test("Questions with the same options auto-answer the blank", () => {
    // Manually select the test path 
    expect(upcomingCardIds()).toEqual(["TestPathSelection"]);
    clickContinue("TestPathSelection", { answers: ["TestPath3"], auto: false });

    // Manually proceed through the first blank
    expect(upcomingCardIds()).toEqual(["Path3Question1", "Path3Question2"]);
    clickContinue("Path3Question1", { answers: ["Path3Question1Blank"], auto: false });

    // The second blank is auto-answered because we do not have a passport value but we've seen all options before
    expect(computePassport()?.data).not.toHaveProperty("option");
    expect(autoAnswerableOptions("Path3Question1")).toEqual(["Path3Question1Blank"]);
  });

  test("Questions with different options do not auto-answer the blank", () => {
    // Manually select the test path 
    expect(upcomingCardIds()).toEqual(["TestPathSelection"]);
    clickContinue("TestPathSelection", { answers: ["TestPath4"], auto: false });

    // Manually proceed through the first blank
    expect(upcomingCardIds()).toEqual(["Path4Question1", "Path4Question2", "Path4Question3"]);
    clickContinue("Path4Question1", { answers: ["Path4Question1Blank"], auto: false });

    // The second blank is put to the user because we do not have a passport value and we have NOT seen all options before
    expect(computePassport()?.data).not.toHaveProperty("option");
    expect(autoAnswerableOptions("Path4Question2")).toBeUndefined;

    // Manually proceed through the second blank
    clickContinue("Path4Question2", { answers: ["Path4Question2Blank"], auto: false });

    // The third blank is auto-answered because we do not have a passport value but we've seen all options before now
    expect(computePassport()?.data).not.toHaveProperty("option");
    expect(autoAnswerableOptions("Path4Question3")).toEqual(["Path4Question3Blank"]);
  });

  test("Checklist then a Question with the same options auto-answer the blank", () => {
    // Manually select the test path 
    expect(upcomingCardIds()).toEqual(["TestPathSelection"]);
    clickContinue("TestPathSelection", { answers: ["TestPath5"], auto: false });

    // Manually proceed through the first blank
    expect(upcomingCardIds()).toEqual(["Path5Checklist", "Path5Question"]);
    clickContinue("Path5Checklist", { answers: ["Path5ChecklistBlank"], auto: false });

    // The second blank is auto-answered because we do not have a passport value but we've seen all options before
    expect(computePassport()?.data).not.toHaveProperty("option");
    expect(autoAnswerableOptions("Path5Question")).toEqual(["Path5QuestionBlank"]);
  });
});

// editor.planx.dev/testing/automate-blanks-test
const flow: Store.Flow = {
  "_root": {
    "edges": [
      "TestPathSelection"
    ]
  },
  "Path5Checklist1OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path5Checklist": {
    "data": {
      "fn": "option",
      "text": "Options 1",
      "allRequired": false
    },
    "type": 105,
    "edges": [
      "Path5ChecklistOptionA",
      "Path5ChecklistOptionB",
      "Path5ChecklistBlank"
    ]
  },
  "Path4Question2Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path3Question2": {
    "data": {
      "fn": "option",
      "text": "Options 2"
    },
    "type": 100,
    "edges": [
      "Path3Question2OptionA",
      "Path3Question2Blank"
    ]
  },
  "Path1Checklist1": {
    "data": {
      "fn": "option",
      "text": "Options 1",
      "allRequired": false
    },
    "type": 105,
    "edges": [
      "Path5Checklist1OptionA",
      "Path5Checklist1OptionB",
      "Path5Checklist1Blank"
    ]
  },
  "Path5ChecklistOptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "TestPathSelection": {
    "data": {
      "text": "Which flow?"
    },
    "type": 100,
    "edges": [
      "TestPath1",
      "TestPath2",
      "TestPath3",
      "TestPath4",
      "TestPath5"
    ]
  },
  "Path3Question1": {
    "data": {
      "fn": "option",
      "text": "Options 1"
    },
    "type": 100,
    "edges": [
      "Path3Question1OptionA",
      "Path3Question1Blank"
    ]
  },
  "Path5Question": {
    "data": {
      "fn": "option",
      "text": "Options 2"
    },
    "type": 100,
    "edges": [
      "Path5QuestionOptionA",
      "Path5QuestionOptionB",
      "Path5QuestionBlank"
    ]
  },
  "Path3Question1OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path3Question2OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path1Checklist2OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path2Checklist1": {
    "data": {
      "fn": "option",
      "text": "Options 1",
      "allRequired": false
    },
    "type": 105,
    "edges": [
      "Path2Checklist1OptionA",
      "Path2Checklist1OptionB",
      "Path2Checklist1Blank"
    ]
  },
  "Path5QuestionBlank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path2Checklist2Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path4Question1": {
    "data": {
      "fn": "option",
      "text": "Options 1"
    },
    "type": 100,
    "edges": [
      "Path4Question1OptionA",
      "Path4Question1Blank"
    ]
  },
  "TestPath2": {
    "data": {
      "text": "2",
      "description": "Checklists with different options"
    },
    "type": 200,
    "edges": [
      "Path2Checklist1",
      "Path2Checklist2"
    ]
  },
  "Path4Question2OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path4Question1Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "TestPath5": {
    "data": {
      "text": "5",
      "description": "Checklist then question with same options"
    },
    "type": 200,
    "edges": [
      "Path5Checklist",
      "Path5Question"
    ]
  },
  "Path4Question1OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path2Checklist2OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path5ChecklistOptionB": {
    "data": {
      "val": "b",
      "text": "B"
    },
    "type": 200
  },
  "Path1Checklist2OptionB": {
    "data": {
      "val": "b",
      "text": "B"
    },
    "type": 200
  },
  "Path5QuestionOptionB": {
    "data": {
      "val": "b",
      "text": "B"
    },
    "type": 200
  },
  "TestPath3": {
    "data": {
      "text": "3",
      "description": "Questions with same options"
    },
    "type": 200,
    "edges": [
      "Path3Question1",
      "Path3Question2"
    ]
  },
  "Path3Question1Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path2Checklist2OptionB": {
    "data": {
      "val": "b",
      "text": "B"
    },
    "type": 200
  },
  "Path4Question2OptionB": {
    "data": {
      "val": "b",
      "text": "B"
    },
    "type": 200
  },
  "Path3Question2Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path2Checklist1Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path5Checklist1Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path4Question3": {
    "data": {
      "fn": "option",
      "text": "Options 3"
    },
    "type": 100,
    "edges": [
      "Path4Question3OptionB",
      "Path4Question3OptionA",
      "Path4Question3Blank"
    ]
  },
  "Path4Question3Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path1Checklist2": {
    "data": {
      "fn": "option",
      "text": "Options 2",
      "allRequired": false
    },
    "type": 105,
    "edges": [
      "Path1Checklist2OptionA",
      "Path1Checklist2OptionB",
      "Path1Checklist2Blank"
    ]
  },
  "TestPath1": {
    "data": {
      "text": "1",
      "description": "Checklists with same options"
    },
    "type": 200,
    "edges": [
      "Path1Checklist1",
      "Path1Checklist2"
    ]
  },
  "TestPath4": {
    "data": {
      "text": "4",
      "description": "Questions with different options"
    },
    "type": 200,
    "edges": [
      "Path4Question1",
      "Path4Question2",
      "Path4Question3"
    ]
  },
  "Path5ChecklistBlank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path4Question2": {
    "data": {
      "fn": "option",
      "text": "Options 2"
    },
    "type": 100,
    "edges": [
      "Path4Question2OptionA",
      "Path4Question2OptionB",
      "Path4Question2Blank"
    ]
  },
  "Path1Checklist2Blank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "Path4Question3OptionB": {
    "data": {
      "val": "b",
      "text": "B"
    },
    "type": 200
  },
  "Path2Checklist1OptionB": {
    "data": {
      "val": "b",
      "text": "B"
    },
    "type": 200
  },
  "Path2Checklist2": {
    "data": {
      "fn": "option",
      "text": "Options 2",
      "allRequired": false
    },
    "type": 105,
    "edges": [
      "Path2Checklist2OptionA",
      "Path2Checklist2OptionB",
      "Path2Checklist2OptionC",
      "Path2Checklist2Blank"
    ]
  },
  "Path5Checklist1OptionB": {
    "data": {
      "val": "b",
      "text": "B"
    },
    "type": 200
  },
  "Path4Question3OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path5QuestionOptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path2Checklist1OptionA": {
    "data": {
      "val": "a",
      "text": "A"
    },
    "type": 200
  },
  "Path2Checklist2OptionC": {
    "data": {
      "val": "c",
      "text": "C"
    },
    "type": 200
  }
};
