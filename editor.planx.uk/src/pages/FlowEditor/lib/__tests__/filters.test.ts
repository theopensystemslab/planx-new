import { Store, useStore } from "../store";
import { clickContinue, visitedNodes } from "./utils";

const { getState, setState } = useStore;
const {
  upcomingCardIds,
  resetPreview,
  autoAnswerableFlag,
  autoAnswerableOptions,
} = getState();

describe("A filter on the root of the graph", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow: flowWithFilters });
  });

  test("Filter options are auto-answered correctly when a higher order flag is collected first", () => {
    expect(upcomingCardIds()).toEqual([
      "FirstQuestion",
      "SecondQuestion",
      "RootFilter",
      "BranchingQuestion",
      "EndNotice",
    ]);
    clickContinue("FirstQuestion", {
      answers: ["FirstQuestionYesAnswer"],
      auto: false,
    });
    clickContinue("SecondQuestion", {
      answers: ["SecondQuestionNoAnswer"],
      auto: false,
    });

    expect(upcomingCardIds()?.[0]).toEqual("RootFilter");
    expect(autoAnswerableFlag("RootFilter")).toEqual("RootFilterYes");
  });

  test("Filter options are auto-answered correctly when a lower order flag is collected first", () => {
    expect(upcomingCardIds()).toEqual([
      "FirstQuestion",
      "SecondQuestion",
      "RootFilter",
      "BranchingQuestion",
      "EndNotice",
    ]);
    clickContinue("FirstQuestion", {
      answers: ["FirstQuestionNoAnswer"],
      auto: false,
    });
    clickContinue("SecondQuestion", {
      answers: ["SecondQuestionYesAnswer"],
      auto: false,
    });

    expect(upcomingCardIds()?.[0]).toEqual("RootFilter");
    expect(autoAnswerableFlag("RootFilter")).toEqual("RootFilterYes");
  });

  test("Filter 'No flag result' option is auto-answered correctly when no flags in this category have been collected", () => {
    expect(upcomingCardIds()).toEqual([
      "FirstQuestion",
      "SecondQuestion",
      "RootFilter",
      "BranchingQuestion",
      "EndNotice",
    ]);
    clickContinue("FirstQuestion", {
      answers: ["FirstQuestionIdkAnswer"],
      auto: false,
    });
    clickContinue("SecondQuestion", {
      answers: ["SecondQuestionIdkAnswer"],
      auto: false,
    });

    expect(upcomingCardIds()?.[0]).toEqual("RootFilter");
    expect(autoAnswerableFlag("RootFilter")).toEqual("RootFilterNoFlagResult");
  });
});

describe("A filter on a branch", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow: flowWithFilters });
  });

  test("Filter options are auto-answered correctly when a higher order flag is collected first", () => {
    clickContinue("FirstQuestion", {
      answers: ["FirstQuestionYesAnswer"],
      auto: false,
    });
    clickContinue("SecondQuestion", {
      answers: ["SecondQuestionNoAnswer"],
      auto: false,
    });
    clickContinue("RootFilter", { answers: ["RootFilterYes"], auto: true });

    expect(upcomingCardIds()?.[0]).toEqual("AutoAnswerableChecklist");
    expect(autoAnswerableOptions("AutoAnswerableChecklist")).toEqual([
      "ChecklistFacadeAnswer",
    ]);
    clickContinue("AutoAnswerableChecklist", {
      answers: ["ChecklistFacadeAnswer"],
      auto: true,
    });

    clickContinue("BranchingQuestion", {
      answers: ["GoToBranchAnswer"],
      auto: false,
    });

    expect(upcomingCardIds()?.[0]).toEqual("BranchFilter");
    expect(autoAnswerableFlag("BranchFilter")).toEqual("BranchFilterYes");
  });

  test("Filter options are auto-answered correctly when a lower order flag is collected first", () => {
    clickContinue("FirstQuestion", {
      answers: ["FirstQuestionNoAnswer"],
      auto: false,
    });
    clickContinue("SecondQuestion", {
      answers: ["SecondQuestionYesAnswer"],
      auto: false,
    });
    clickContinue("RootFilter", { answers: ["RootFilterYes"], auto: true });

    expect(upcomingCardIds()?.[0]).toEqual("AutoAnswerableChecklist");
    expect(autoAnswerableOptions("AutoAnswerableChecklist")).toEqual([
      "ChecklistLandscapingAnswer",
    ]);
    clickContinue("AutoAnswerableChecklist", {
      answers: ["ChecklistLandscapingAnswer"],
      auto: true,
    });

    clickContinue("BranchingQuestion", {
      answers: ["GoToBranchAnswer"],
      auto: false,
    });

    expect(upcomingCardIds()?.[0]).toEqual("BranchFilter");
    expect(autoAnswerableFlag("BranchFilter")).toEqual("BranchFilterYes");
  });

  test("Filter 'No flag result' option is auto-answered correctly when no flags in this category have been collected", () => {
    clickContinue("FirstQuestion", {
      answers: ["FirstQuestionIdkAnswer"],
      auto: false,
    });
    clickContinue("SecondQuestion", {
      answers: ["SecondQuestionIdkAnswer"],
      auto: false,
    });
    clickContinue("RootFilter", {
      answers: ["RootFilterNoFlagResult"],
      auto: true,
    });
    clickContinue("BranchingQuestion", {
      answers: ["GoToBranchAnswer"],
      auto: false,
    });

    expect(upcomingCardIds()?.[0]).toEqual("BranchFilter");
    expect(autoAnswerableFlag("BranchFilter")).toEqual(
      "BranchFilterNoFlagResult",
    );
  });
});

describe("Auto-answerable Questions or Checklists on filter paths", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow: flowWithFilters });
  });

  test("Are only auto-answered when they are reached and when the path matches the result", () => {
    clickContinue("FirstQuestion", {
      answers: ["FirstQuestionYesAnswer"],
      auto: false,
    });
    clickContinue("SecondQuestion", {
      answers: ["SecondQuestionYesAnswer"],
      auto: false,
    });
    expect(visitedNodes()).not.toContain("AutoAnswerableChecklist");

    expect(upcomingCardIds()?.[0]).toEqual("RootFilter");
    expect(autoAnswerableFlag("RootFilter")).toEqual("RootFilterYes");
    clickContinue("RootFilter", { answers: ["RootFilterYes"], auto: true });

    expect(upcomingCardIds()?.[0]).toEqual("AutoAnswerableChecklist");
    expect(autoAnswerableOptions("AutoAnswerableChecklist")).toEqual([
      "ChecklistFacadeAnswer",
      "ChecklistLandscapingAnswer",
    ]);
  });

  test("Are never auto-answered if the path does not match the result", () => {
    clickContinue("FirstQuestion", {
      answers: ["FirstQuestionNoAnswer"],
      auto: false,
    });
    clickContinue("SecondQuestion", {
      answers: ["SecondQuestionIdkAnswer"],
      auto: false,
    });
    expect(visitedNodes()).not.toContain("AutoAnswerableChecklist");

    expect(upcomingCardIds()?.[0]).toEqual("RootFilter");
    expect(autoAnswerableFlag("RootFilter")).toEqual("RootFilterNo");
    clickContinue("RootFilter", { answers: ["RootFilterNo"], auto: true });

    expect(upcomingCardIds()).not.toContain("AutoAnswerableChecklist");
  });
});

const flowWithFilters: Store.Flow = {
  _root: {
    edges: [
      "FirstQuestion",
      "SecondQuestion",
      "RootFilter",
      "BranchingQuestion",
      "EndNotice",
    ],
  },
  SecondQuestionYesAnswer: {
    data: {
      val: "alter.landscaping",
      flags: ["MCOU_TRUE"],
      text: "Yes",
    },
    type: 200,
  },
  FirstQuestionNoAnswer: {
    data: {
      flags: ["MCOU_FALSE"],
      text: "No",
    },
    type: 200,
  },
  AutoAnswerableChecklist: {
    data: {
      fn: "proposal.projectType",
      text: "What are you altering?",
      allRequired: false,
    },
    type: 105,
    edges: ["ChecklistFacadeAnswer", "ChecklistLandscapingAnswer"],
  },
  RootFilterYes: {
    data: {
      val: "MCOU_TRUE",
      text: "Material change of use",
    },
    type: 200,
    edges: ["AutoAnswerableChecklist"],
  },
  BranchingQuestion: {
    data: {
      text: "What about a filter on a branch?",
    },
    type: 100,
    edges: ["GoToBranchAnswer", "SkipBranchAnswer"],
  },
  EndNotice: {
    data: {
      color: "#EFEFEF",
      title: "End of test",
      resetButton: true,
    },
    type: 8,
  },
  RootFilterNoFlagResult: {
    data: {
      text: "No flag result",
    },
    type: 200,
  },
  BranchFilter: {
    data: {
      fn: "flag",
      category: "Material change of use",
    },
    type: 500,
    edges: ["BranchFilterYes", "BranchFilterNo", "BranchFilterNoFlagResult"],
  },
  BranchFilterNo: {
    data: {
      val: "MCOU_FALSE",
      text: "Not material change of use",
    },
    type: 200,
  },
  ChecklistLandscapingAnswer: {
    data: {
      val: "alter.landscaping",
      text: "Landscaping",
    },
    type: 200,
  },
  RootFilterNo: {
    data: {
      val: "MCOU_FALSE",
      text: "Not material change of use",
    },
    type: 200,
  },
  ChecklistFacadeAnswer: {
    data: {
      val: "alter.facade",
      text: "Facade",
    },
    type: 200,
  },
  FirstQuestion: {
    data: {
      fn: "proposal.projectType",
      tags: [],
      text: "Are you changing the building facade?",
    },
    type: 100,
    edges: [
      "FirstQuestionYesAnswer",
      "FirstQuestionNoAnswer",
      "FirstQuestionIdkAnswer",
    ],
  },
  BranchFilterNoFlagResult: {
    data: {
      text: "No flag result",
    },
    type: 200,
  },
  FirstQuestionYesAnswer: {
    data: {
      val: "alter.facade",
      flags: ["MCOU_TRUE"],
      text: "Yes",
    },
    type: 200,
  },
  BranchFilterYes: {
    data: {
      val: "MCOU_TRUE",
      text: "Material change of use",
    },
    type: 200,
  },
  FirstQuestionIdkAnswer: {
    data: {
      text: "I don't know",
    },
    type: 200,
  },
  GoToBranchAnswer: {
    data: {
      text: "Let's go",
    },
    type: 200,
    edges: ["BranchFilter"],
  },
  RootFilter: {
    data: {
      fn: "flag",
      category: "Material change of use",
    },
    type: 500,
    edges: ["RootFilterYes", "RootFilterNo", "RootFilterNoFlagResult"],
  },
  SecondQuestionNoAnswer: {
    data: {
      flags: ["MCOU_FALSE"],
      text: "No",
    },
    type: 200,
  },
  SecondQuestionIdkAnswer: {
    data: {
      text: "I don't know",
    },
    type: 200,
  },
  SkipBranchAnswer: {
    data: {
      text: "Skip it",
    },
    type: 200,
  },
  SecondQuestion: {
    data: {
      fn: "proposal.projectType",
      tags: [],
      text: "Are you changing the landscaping materials?",
    },
    type: 100,
    edges: [
      "SecondQuestionYesAnswer",
      "SecondQuestionNoAnswer",
      "SecondQuestionIdkAnswer",
    ],
  },
};
