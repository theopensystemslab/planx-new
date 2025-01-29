import { ComponentType as TYPES, type FlowGraph } from "@opensystemslab/planx-core/types";
import { hasStatutoryApplicationPath } from "./helpers.js";

describe("hasStatutoryApplicationPath", () => {
  test("returns false for a flow that doesn't have a Send", () => {
    expect(hasStatutoryApplicationPath(mockStatutoryFlowWithoutSend)).toEqual(false);
  });

  test.todo("returns false for a flow with Send but not any application.type");

  test.todo("returns false for a flow with Send but only discretionary application.type values");

  test("returns true for a flow with Send and at least one statutory application.type value", () => {
    expect(hasStatutoryApplicationPath(mockStatutoryFlow)).toEqual(true);
  });
});

const mockStatutoryFlow: FlowGraph = {
  "_root": {
      "edges": [
          "QuestionOne",
          "Send"
      ]
  },
  "QuestionTwo": {
      "data": {
          "fn": "application.type",
          "text": "What type of application is it?",
          "neverAutoAnswer": false
      },
      "type": TYPES.Question,
      "edges": [
          "AnswerWithDiscretionaryApplicationValue",
          "AnswerWithStatutoryApplicationValue",
          "VeeQdrkcef"
      ]
  },
  "AnswerWithDiscretionaryApplicationValue": {
      "data": {
          "val": "findOut",
          "text": "Find out if"
      },
      "type": TYPES.Answer
  },
  "VeeQdrkcef": {
      "data": {
          "text": "Something else"
      },
      "type": TYPES.Answer
  },
  "AnswerWithStatutoryApplicationValue": {
      "data": {
          "val": "ldc",
          "text": "LDC"
      },
      "type": TYPES.Answer
  },
  "QuestionOne": {
      "type": TYPES.Question,
      "data": {
          "text": "Branching question",
          "neverAutoAnswer": false
      },
      "edges": [
          "7lDopQVOjk",
          "V5ZV8milBj"
      ]
  },
  "7lDopQVOjk": {
      "type": TYPES.Answer,
      "data": {
          "text": "Left"
      },
      "edges": [
          "QuestionTwo"
      ]
  },
  "V5ZV8milBj": {
      "type": TYPES.Answer,
      "data": {
          "text": "Right"
      }
  },
  "Send": {
      "type": TYPES.Send,
      "data": {
          "title": "Send to email",
          "destinations": [
              "email"
          ]
      }
  }
};

// TODO debug this, ensure deep/unique copy
const mockStatutoryFlowWithoutSend: FlowGraph = mockStatutoryFlow;
delete mockStatutoryFlowWithoutSend["Send"];

// TODO also add mocks which use SetValue, etc