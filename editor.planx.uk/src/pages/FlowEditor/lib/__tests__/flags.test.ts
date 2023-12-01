import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

describe("in a flow with no collected flags, the user", () => {
  beforeEach(() => {
    getState().resetPreview();

    setState({
      flow: {
        _root: {
          edges: ["question", "filter"],
        },
        question: {
          type: TYPES.Statement,
          edges: ["missing_info_answer", "immune_answer", "noflag_answer"],
        },
        missing_info_answer: {
          type: TYPES.Response,
          data: {
            flag: "MISSING_INFO",
          },
        },
        immune_answer: {
          type: TYPES.Response,
          data: {
            flag: "IMMUNE",
          },
        },
        noflag_answer: {
          type: TYPES.Response,
        },
        filter: {
          type: TYPES.Filter,
          edges: ["missing_info_flag", "immune_flag", "no_flag"],
        },
        missing_info_flag: {
          type: TYPES.Response,
          data: {
            val: "MISSING_INFO",
          },
          edges: ["missing_info_followup"],
        },
        immune_flag: {
          type: TYPES.Response,
          data: {
            val: "IMMUNE",
          },
          edges: ["immune_followup"],
        },
        no_flag: {
          type: TYPES.Response,
          edges: ["noflag_followup"],
        },
        missing_info_followup: { type: TYPES.Content },
        immune_followup: { type: TYPES.Content },
        noflag_followup: { type: TYPES.Content },
      },
    });
  });

  it.skip("will follow a path that doesn't require flags by default", () => {
    expect(getState().upcomingCardIds()).toEqual(["question", "filter"]);
  });

  const scenarios: [string, string[], string][] = [
    ["missing_info_answer", ["MISSING_INFO"], "missing_info_followup"],
    ["immune_answer", ["IMMUNE"], "immune_followup"],
    ["noflag_answer", [], "noflag_followup"],
  ];

  scenarios.forEach(([answer, flags, followup]) => {
    it(`but after visiting [${answer}], collects [${flags}] and the next question is [${followup}]`, () => {
      getState().record("question", { answers: [answer] });
      expect(getState().collectedFlags("question")).toEqual(flags);
      expect(getState().upcomingCardIds()).toEqual([followup]);
    });
  });
});

describe("changing flag inside flag filter doesn't affect the filter's behaviour", () => {
  // https://imgur.com/kVeyr1t
  beforeEach(() => {
    getState().resetPreview();
    setState({
      flow: {
        _root: {
          edges: ["q1", "filter"],
        },
        missing_info: {
          data: {
            val: "MISSING_INFO",
            text: "Missing information",
          },
          type: TYPES.Response,
          edges: ["missing_info_content"],
        },
        q2: {
          data: {
            text: "another",
          },
          type: TYPES.Statement,
          edges: ["missing_2", "nothing_2"],
        },
        missing_info_content: {
          data: {
            content: "missing info",
          },
          type: TYPES.Content,
        },
        nothing_2: {
          data: {
            text: "nothing",
          },
          type: TYPES.Response,
        },
        no_result: {
          data: {
            text: "(No Result)",
          },
          type: TYPES.Response,
          edges: ["q2"],
        },
        missing_2: {
          data: {
            flag: "MISSING_INFO",
            text: "missing",
          },
          type: TYPES.Response,
        },
        immune: {
          data: {
            val: "IMMUNE",
            text: "Immune",
          },
          type: TYPES.Response,
        },
        filter: {
          data: {
            fn: "flag",
          },
          type: TYPES.Filter,
          edges: ["missing_info", "immune", "no_result"],
        },
        q1: {
          type: TYPES.Statement,
          data: {
            text: "q",
          },
          edges: ["missing_1", "nothing_1"],
        },
        missing_1: {
          type: TYPES.Response,
          data: {
            text: "missing",
            flag: "MISSING_INFO",
          },
        },
        nothing_1: {
          type: TYPES.Response,
          data: {
            text: "nothing",
          },
        },
      },
    });
  });

  test("nothing_1 > missing_2", () => {
    getState().record("q1", { answers: ["nothing_1"] });
    getState().record("q2", { answers: ["missing_2"] });
    expect(getState().upcomingCardIds()).toEqual([]);
  });

  test("nothing_1 > nothing_2", () => {
    getState().record("q1", { answers: ["nothing_1"] });
    getState().record("q2", { answers: ["nothing_2"] });
    expect(getState().upcomingCardIds()).toEqual([]);
  });

  test("missing_1", () => {
    getState().record("q1", { answers: ["missing_1"] });
    expect(getState().upcomingCardIds()).toEqual(["missing_info_content"]);
  });
});

describe("displaying flags as result", () => {
  beforeEach(() => getState().resetPreview());
  it("returns a reasonable default state", () => {
    const defaultState = {
      "Planning permission": {
        displayText: {
          description: "Planning permission",
          heading: "No result",
        },
        flag: {
          bgColor: "#EEEEEE",
          category: "Planning permission",
          color: "#000000",
          text: "No result",
          value: undefined,
          description: "",
        },
        responses: [],
      },
    };

    const data = getState().resultData();
    expect(data).toEqual(defaultState);
  });
});
