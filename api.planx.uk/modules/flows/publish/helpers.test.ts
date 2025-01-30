import {
  ComponentType as TYPES,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";
import { hasStatutoryApplicationType } from "./helpers.js";

describe("hasStatutoryApplicationPath", () => {
  beforeAll(() => {
    vi.mock("@opensystemslab/planx-core", () => {
      return {
        getValidSchemaValues: vi.fn().mockImplementation(() => ["ldc"]),
      };
    });
  });

  test("returns false for a flow that doesn't have a Send", () => {
    expect(hasStatutoryApplicationType(mockStatutoryFlowWithoutSend)).toEqual(
      false,
    );
  });

  test("returns false for a flow with Send but not any application.type", () => {
    expect(
      hasStatutoryApplicationType(mockStatutoryFlowWithoutAppType),
    ).toEqual(false);
  });

  test("returns false for a flow with Send but only discretionary application.type values", () => {
    expect(
      hasStatutoryApplicationType(mockStatutoryFlowWithoutStatutoryApp),
    ).toEqual(false);
  });

  test("returns true for a flow with Send and at least one statutory application.type value", () => {
    expect(hasStatutoryApplicationType(mockStatutoryFlow)).toEqual(true);
  });

  test("returns true for a flow with Send and at least one statutory application.type in a SetValue Component", () => {
    expect(
      hasStatutoryApplicationType(mockSetValueStatutoryApplicationType),
    ).toEqual(true);
  });
});

const mockStatutoryFlow: FlowGraph = {
  _root: {
    edges: ["QuestionOne", "Send"],
  },
  QuestionTwo: {
    data: {
      fn: "application.type",
      text: "What type of application is it?",
      neverAutoAnswer: false,
    },
    type: TYPES.Question,
    edges: [
      "AnswerWithDiscretionaryApplicationValue",
      "AnswerWithStatutoryApplicationValue",
      "VeeQdrkcef",
    ],
  },
  AnswerWithDiscretionaryApplicationValue: {
    data: {
      val: "findOut",
      text: "Find out if",
    },
    type: TYPES.Answer,
  },
  VeeQdrkcef: {
    data: {
      text: "Something else",
    },
    type: TYPES.Answer,
  },
  AnswerWithStatutoryApplicationValue: {
    data: {
      val: "ldc",
      text: "LDC",
    },
    type: TYPES.Answer,
  },
  QuestionOne: {
    type: TYPES.Question,
    data: {
      text: "Branching question",
      neverAutoAnswer: false,
    },
    edges: ["7lDopQVOjk", "V5ZV8milBj"],
  },
  "7lDopQVOjk": {
    type: TYPES.Answer,
    data: {
      text: "Left",
    },
    edges: ["QuestionTwo"],
  },
  V5ZV8milBj: {
    type: TYPES.Answer,
    data: {
      text: "Right",
    },
  },
  Send: {
    type: TYPES.Send,
    data: {
      title: "Send to email",
      destinations: ["email"],
    },
  },
};

const mockStatutoryFlowWithoutSend = { ...mockStatutoryFlow };
delete mockStatutoryFlowWithoutSend["Send"];

const mockStatutoryFlowWithoutAppType = { ...mockStatutoryFlow };
delete mockStatutoryFlowWithoutAppType["QuestionTwo"];

const mockStatutoryFlowWithoutStatutoryApp = { ...mockStatutoryFlow };
delete mockStatutoryFlowWithoutStatutoryApp[
  "AnswerWithStatutoryApplicationValue"
];

const mockSetValueStatutoryApplicationType = {
  ...mockStatutoryFlow,
  SetValueStatutoryAppType: {
    data: {
      fn: "application.type",
      val: "ldc",
      operation: "replace",
    },
    type: TYPES.SetValue,
  },
} as FlowGraph;

delete mockSetValueStatutoryApplicationType[
  "AnswerWithStatutoryApplicationValue"
];
