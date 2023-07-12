import { act } from "@testing-library/react";
import { FullStore, Store } from "pages/FlowEditor/lib/store";
import { vanillaStore } from "pages/FlowEditor/lib/store";

import flowWithThreeSections from "../../../../../pages/FlowEditor/lib/__tests__/mocks/flowWithThreeSections.json";
import { getBOPSParams } from "..";
import { QuestionAndResponses } from "./../../model";

const { setState, getState } = vanillaStore;
let initialState: FullStore;

const sectionBreadcrumbs: Store.breadcrumbs = {
  firstSection: {
    auto: false,
  },
  firstQuestion: {
    auto: false,
    answers: ["firstAnswer"],
  },
  secondSection: {
    auto: false,
  },
  secondQuestion: {
    auto: false,
    answers: ["secondAnswer"],
  },
  thirdSection: {
    auto: false,
  },
  thirdQuestion: {
    auto: false,
    answers: ["thirdAnswer"],
  },
};

const simpleBreadcrumbs: Store.breadcrumbs = {
  firstQuestion: {
    auto: false,
    answers: ["firstAnswer"],
  },
  secondQuestion: {
    auto: false,
    answers: ["secondAnswer"],
  },
  thirdQuestion: {
    auto: false,
    answers: ["thirdAnswer"],
  },
};

const simpleFlow: Store.flow = {
  _root: {
    edges: ["firstQuestion", "secondQuestion", "thirdQuestion"],
  },
  firstAnswer: {
    data: {
      text: "Answer 1",
    },
    type: 200,
  },
  thirdAnswer: {
    data: {
      text: "Answer 3",
    },
    type: 200,
  },
  secondAnswer: {
    data: {
      text: "Answer 2",
    },
    type: 200,
  },
  firstQuestion: {
    data: {
      text: "First Question",
    },
    type: 100,
    edges: ["firstAnswer"],
  },
  thirdQuestion: {
    data: {
      text: "Third Question",
    },
    type: 100,
    edges: ["thirdAnswer"],
  },
  secondQuestion: {
    data: {
      text: "Second Question",
    },
    type: 100,
    edges: ["secondAnswer"],
  },
};

describe("Flow with sections", () => {
  beforeAll(() => {
    initialState = getState();
    act(() =>
      setState({
        flow: flowWithThreeSections,
        breadcrumbs: sectionBreadcrumbs,
      }),
    );
    act(() => getState().initNavigationStore());
  });

  afterAll(() => {
    setState(initialState);
  });

  it("Appends a section_name to each metadata object", () => {
    const result = getBOPSParams({
      breadcrumbs: sectionBreadcrumbs,
      flow: flowWithThreeSections,
      passport: {},
      sessionId: "session-123",
      flowName: "test-flow",
    });

    result.proposal_details?.forEach((detail) => {
      expect(detail.metadata).toHaveProperty("section_name");
    });
  });

  it("Appends the correct section name to metadata objects", () => {
    const result = getBOPSParams({
      breadcrumbs: sectionBreadcrumbs,
      flow: flowWithThreeSections,
      passport: {},
      sessionId: "session-123",
      flowName: "test-flow",
    });

    console.log(result.proposal_details);
    const [first, second, third] =
      result.proposal_details as QuestionAndResponses[];

    expect(first?.metadata?.section_name).toBe("First section");
    expect(second?.metadata?.section_name).toBe("Second section");
    expect(third?.metadata?.section_name).toBe("Third section");
  });
});

describe("Flow without sections", () => {
  it("Does not append section_name to any metadata objects", () => {
    const result = getBOPSParams({
      breadcrumbs: simpleBreadcrumbs,
      flow: simpleFlow,
      passport: {},
      sessionId: "session-123",
      flowName: "test-flow",
    });

    result.proposal_details?.forEach((detail) => {
      expect(detail.metadata).not.toHaveProperty("section_name");
    });
  });
});
