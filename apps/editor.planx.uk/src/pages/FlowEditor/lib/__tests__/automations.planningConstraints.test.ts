import { Store, useStore } from "../store";
import { clickContinue } from "./utils";

const { getState, setState } = useStore;
const {
  upcomingCardIds,
  resetPreview,
  autoAnswerableOptions,
  computePassport,
} = getState();

describe("Auto-answering based on planning constraints", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow });
  });

  test("When there are postive intersecting constraints and `_nots`", () => {
    expect(upcomingCardIds()).toEqual([
      "PlanningConstraints",
      "ConservationAreaQuestion",
      "Article4Question",
      "FloodZone1Question",
    ]);

    // Manually proceed forward through PlanningConstraints as if we've checked 4x datasets: Article 4, Conservation Area, Flood Zone 2, Flood Zone 3
    clickContinue("PlanningConstraints", {
      data: {
        "property.constraints.planning": ["articleFour"],
        _nots: {
          "property.constraints.planning": [
            "designated.conservationArea",
            "flood.zoneTwo",
            "flood.zoneThree",
          ],
        },
      },
      auto: false,
    });

    expect(computePassport()?.data).toHaveProperty(
      "property.constraints.planning",
    );
    expect(computePassport()?.data).toHaveProperty([
      "_nots",
      "property.constraints.planning",
    ]);

    // Confirm auto-answer behavior
    expect(autoAnswerableOptions("ConservationAreaQuestion")).toEqual([
      "ConservationAreaNo",
    ]);
    expect(autoAnswerableOptions("Article4Question")).toEqual(["Article4Yes"]);
    expect(autoAnswerableOptions("FloodZone1Question")).toBeUndefined(); // Puts to user because unseen option
  });

  test("When there are only negative `_nots` constraints", () => {
    expect(upcomingCardIds()).toEqual([
      "PlanningConstraints",
      "ConservationAreaQuestion",
      "Article4Question",
      "FloodZone1Question",
    ]);

    // Manually proceed forward through PlanningConstraints as if we've checked 4x datasets: Article 4, Conservation Area, Flood Zone 2, Flood Zone 3
    clickContinue("PlanningConstraints", {
      data: {
        _nots: {
          "property.constraints.planning": [
            "articleFour",
            "designated.conservationArea",
            "flood.zoneTwo",
            "flood.zoneThree",
          ],
        },
      },
      auto: false,
    });

    expect(computePassport()?.data).not.toHaveProperty(
      "property.constraints.planning",
    );
    expect(computePassport()?.data).toHaveProperty([
      "_nots",
      "property.constraints.planning",
    ]);

    // Confirm auto-answer behavior
    expect(autoAnswerableOptions("ConservationAreaQuestion")).toEqual([
      "ConservationAreaNo",
    ]);
    expect(autoAnswerableOptions("Article4Question")).toEqual(["Article4No"]);
    expect(autoAnswerableOptions("FloodZone1Question")).toBeUndefined(); // Puts to user because unseen option
  });

  test("When there are only positive intersecting constraints", () => {
    expect(upcomingCardIds()).toEqual([
      "PlanningConstraints",
      "ConservationAreaQuestion",
      "Article4Question",
      "FloodZone1Question",
    ]);

    // Manually proceed forward through PlanningConstraints as if we've checked 4x datasets: Article 4, Conservation Area, Flood Zone 2, Flood Zone 3
    clickContinue("PlanningConstraints", {
      data: {
        "property.constraints.planning": [
          "articleFour",
          "designated.conservationArea",
          "flood.zoneTwo",
          "flood.zoneThree",
        ],
      },
      auto: false,
    });

    expect(computePassport()?.data).toHaveProperty(
      "property.constraints.planning",
    );
    expect(computePassport()?.data).not.toHaveProperty([
      "_nots",
      "property.constraints.planning",
    ]);

    // Confirm auto-answer behavior
    expect(autoAnswerableOptions("ConservationAreaQuestion")).toEqual([
      "ConservationAreaYes",
    ]);
    expect(autoAnswerableOptions("Article4Question")).toEqual(["Article4Yes"]);
    expect(autoAnswerableOptions("FloodZone1Question")).toBeUndefined(); // Puts to user because unseen option
  });

  test("An unseen option is put to the user exactly once then auto-answered", () => {
    const alteredFlow = {
      ...flow,
      _root: {
        edges: [
          "PlanningConstraints",
          "ConservationAreaQuestion",
          "Article4Question",
          "FloodZone1Question", // flood.zoneOne is NOT fetched or set by Planning Data
          "FloodZone1QuestionAgain",
        ],
      },
      FloodZone1QuestionAgain: {
        type: 100,
        data: {
          description:
            "<p>(This dataset is not fetched or set via Planning Data)</p>",
          fn: "property.constraints.planning",
          text: "Are you in flood zone 1? (again)",
          neverAutoAnswer: false,
        },
        edges: ["FloodZone1YesAgain", "FloodZone1NoAgain"],
      },
      FloodZone1YesAgain: {
        type: 200,
        data: {
          text: "Yes (again)",
          val: "flood.zoneOne",
        },
      },
      FloodZone1NoAgain: {
        type: 200,
        data: {
          text: "No (again)",
        },
      },
    };
    resetPreview();
    setState({ flow: alteredFlow });

    expect(upcomingCardIds()).toEqual([
      "PlanningConstraints",
      "ConservationAreaQuestion",
      "Article4Question",
      "FloodZone1Question",
      "FloodZone1QuestionAgain",
    ]);

    // Manually proceed forward through PlanningConstraints as if we've checked 4x datasets: Article 4, Conservation Area, Flood Zone 2, Flood Zone 3
    clickContinue("PlanningConstraints", {
      data: {
        "property.constraints.planning": ["articleFour"],
        _nots: {
          "property.constraints.planning": [
            "designated.conservationArea",
            "flood.zoneTwo",
            "flood.zoneThree",
          ],
        },
      },
      auto: false,
    });

    expect(computePassport()?.data?.["property.constraints.planning"]).toEqual([
      "articleFour",
    ]);
    expect(
      computePassport()?.data?.["_nots"]?.["property.constraints.planning"],
    ).toEqual([
      "designated.conservationArea",
      "flood.zoneTwo",
      "flood.zoneThree",
    ]);

    // Proceed through auto-answerable questions
    clickContinue("ConservationAreaQuestion", {
      answers: autoAnswerableOptions("ConservationAreaQuestion"),
      auto: true,
    });
    clickContinue("Article4Question", {
      answers: autoAnswerableOptions("Article4Question"),
      auto: true,
    });

    // Confirm passport is in same state
    expect(computePassport()?.data?.["property.constraints.planning"]).toEqual([
      "articleFour",
    ]);
    expect(
      computePassport()?.data?.["_nots"]?.["property.constraints.planning"],
    ).toEqual([
      "designated.conservationArea",
      "flood.zoneTwo",
      "flood.zoneThree",
    ]);

    // Manually proceed through the first Flood Zone 1 Question, and expect second occurance to be auto-answered because no longer unseen option
    expect(autoAnswerableOptions("FloodZone1Question")).toBeUndefined();
    clickContinue("FloodZone1Question", {
      answers: ["FloodZone1No"],
      auto: false,
    });
    expect(upcomingCardIds()).toEqual(["FloodZone1QuestionAgain"]);
    expect(autoAnswerableOptions("FloodZone1QuestionAgain")).toEqual([
      "FloodZone1NoAgain",
    ]);
  });

  test("A less granular option is not auto-answered if the passport only has a more granular option (positive intersecting contraints)", () => {
    const alteredFlow = {
      ...flow,
      _root: {
        edges: [
          "PlanningConstraints",
          "ConservationAreaQuestion",
          "Article4Question",
          "FloodZone1Question", // flood.zoneOne is NOT fetched or set by Planning Data
          "DesignatedLandQuestion",
        ],
      },
      DesignatedLandQuestion: {
        type: 100,
        data: {
          fn: "property.constraints.planning",
          text: "Are you on designated land?",
          neverAutoAnswer: false,
        },
        edges: ["DesignatedYes", "DesignatedNo"],
      },
      DesignatedYes: {
        type: 200,
        data: {
          text: "Yes",
          val: "designated",
        },
      },
      DesignatedNo: {
        type: 200,
        data: {
          text: "No",
        },
      },
    };
    resetPreview();
    setState({ flow: alteredFlow });

    // Manually proceed forward through PlanningConstraints as if we've checked 1 dataset: Conservation Area
    clickContinue("PlanningConstraints", {
      data: {
        "property.constraints.planning": ["designated.conservationArea"],
      },
      auto: false,
    });

    expect(computePassport()?.data?.["property.constraints.planning"]).toEqual([
      "designated.conservationArea",
    ]);

    // Planning constraints should exact-match only, never `startsWith`, therefore put to user
    expect(autoAnswerableOptions("DesignatedLandQuestion")).toBeUndefined();
  });

  test("A less granular option is not auto-answered if the passport only has a more granular option (_nots)", () => {
    const alteredFlow = {
      ...flow,
      _root: {
        edges: [
          "PlanningConstraints",
          "ConservationAreaQuestion",
          "Article4Question",
          "FloodZone1Question", // flood.zoneOne is NOT fetched or set by Planning Data
          "DesignatedLandQuestion",
        ],
      },
      DesignatedLandQuestion: {
        type: 100,
        data: {
          fn: "property.constraints.planning",
          text: "Are you on designated land?",
          neverAutoAnswer: false,
        },
        edges: ["DesignatedYes", "DesignatedNo"],
      },
      DesignatedYes: {
        type: 200,
        data: {
          text: "Yes",
          val: "designated",
        },
      },
      DesignatedNo: {
        type: 200,
        data: {
          text: "No",
        },
      },
    };
    resetPreview();
    setState({ flow: alteredFlow });

    // Manually proceed forward through PlanningConstraints as if we've checked 1 dataset: Conservation Area
    clickContinue("PlanningConstraints", {
      data: {
        _nots: {
          "property.constraints.planning": ["designated.conservationArea"],
        },
      },
      auto: false,
    });

    expect(
      computePassport()?.data?.["_nots"]?.["property.constraints.planning"],
    ).toEqual(["designated.conservationArea"]);
    expect(
      computePassport()?.data?.["property.constraints.planning"],
    ).toBeUndefined();

    // Planning constraints should exact-match only, never `startsWith`, therefore put to user
    expect(autoAnswerableOptions("DesignatedLandQuestion")).toBeUndefined();
  });
});

const flow: Store.Flow = {
  _root: {
    edges: [
      "PlanningConstraints",
      "ConservationAreaQuestion",
      "Article4Question",
      "FloodZone1Question", // flood.zoneOne is NOT fetched or set by Planning Data
    ],
  },
  PlanningConstraints: {
    type: 11,
    data: {
      title: "Planning constraints",
      description:
        "Planning constraints might limit how you can develop or use the property",
      fn: "property.constraints.planning",
      disclaimer:
        "<p>This page does not include information about historic planning conditions that may apply to this property.</p>",
    },
  },
  ConservationAreaQuestion: {
    type: 100,
    data: {
      fn: "property.constraints.planning",
      text: "Are you in a conservation area?",
      neverAutoAnswer: false,
      tags: [],
    },
    edges: ["ConservationAreaYes", "ConservationAreaNo"],
  },
  ConservationAreaYes: {
    type: 200,
    data: {
      text: "Yes",
      val: "designated.conservationArea",
    },
  },
  ConservationAreaNo: {
    type: 200,
    data: {
      text: "No",
    },
  },
  Article4Question: {
    type: 100,
    data: {
      fn: "property.constraints.planning",
      text: "Do any Article 4 directions apply?",
      neverAutoAnswer: false,
    },
    edges: ["Article4Yes", "Article4No"],
  },
  Article4Yes: {
    type: 200,
    data: {
      text: "Yes",
      val: "articleFour",
    },
  },
  Article4No: {
    type: 200,
    data: {
      text: "No",
    },
  },
  FloodZone1Question: {
    type: 100,
    data: {
      description:
        "<p>(This dataset is not fetched or set via Planning Data)</p>",
      fn: "property.constraints.planning",
      text: "Are you in flood zone 1?",
      neverAutoAnswer: false,
    },
    edges: ["FloodZone1Yes", "FloodZone1No"],
  },
  FloodZone1Yes: {
    type: 200,
    data: {
      text: "Yes",
      val: "flood.zoneOne",
    },
  },
  FloodZone1No: {
    type: 200,
    data: {
      text: "No",
    },
  },
};
