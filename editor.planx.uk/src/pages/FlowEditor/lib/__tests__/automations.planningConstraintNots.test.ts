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
        "property.constraints.planning": ["article4"],
        _nots: {
          "property.constraints.planning": [
            "designated.conservationArea",
            "flood.zone.2",
            "flood.zone.3",
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
            "article4",
            "designated.conservationArea",
            "flood.zone.2",
            "flood.zone.3",
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
          "article4",
          "designated.conservationArea",
          // "flood.zone.2",
          // "flood.zone.3",
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

  test.todo(
    "An unseen option is put to the user exactly once then auto-answered",
  );
});

const flow: Store.Flow = {
  _root: {
    edges: [
      "PlanningConstraints",
      "ConservationAreaQuestion",
      "Article4Question",
      "FloodZone1Question", // flood.zone.1 is NOT fetched or set by Planning Data
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
        "<p><strong>This page does not include information about historic planning conditions that may apply to this property.</strong></p>",
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
      val: "article4",
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
      val: "flood.zone.1",
    },
  },
  FloodZone1No: {
    type: 200,
    data: {
      text: "No",
    },
  },
};
