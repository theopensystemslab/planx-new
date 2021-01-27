import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

describe("results", () => {
  describe("flags", () => {
    beforeEach(() => {
      setState({
        flow: {
          _root: {
            edges: ["question", "result"],
          },
          question: {
            type: TYPES.Statement,
            edges: ["red_answer", "blue_answer", "noflag_answer"],
          },
          red_answer: {
            type: TYPES.Response,
            data: {
              flag: "RED",
            },
          },
          blue_answer: {
            type: TYPES.Response,
            data: {
              flag: "BLUE",
            },
          },
          noflag_answer: {
            type: TYPES.Response,
          },
          result: {
            type: TYPES.Result,
            data: {
              visible: false,
              fn: "flag",
            },
            edges: ["red_flag", "blue_flag", "no_flag"],
          },
          red_flag: {
            type: TYPES.Response,
            data: {
              val: "RED",
            },
            edges: ["red_followup"],
          },
          blue_flag: {
            type: TYPES.Response,
            data: {
              val: "BLUE",
            },
            edges: ["blue_followup"],
          },
          no_flag: {
            type: TYPES.Response,
            edges: ["noflag_followup"],
          },
          red_followup: { type: TYPES.Content },
          blue_followup: { type: TYPES.Content },
          noflag_followup: { type: TYPES.Content },
        },
      });
    });

    test("jumps to result when flag has been collected", () => {
      expect(getState().upcomingCardIds()).toEqual([
        "question",
        "noflag_followup",
      ]);

      getState().record("question", ["red_answer"]);
      expect(getState().collectedFlags("question")).toEqual(["RED"]);
      expect(getState().upcomingCardIds()).toEqual(["red_followup"]);

      getState().record("question", ["blue_answer"]);
      expect(getState().collectedFlags("question")).toEqual(["BLUE"]);
      expect(getState().upcomingCardIds()).toEqual(["blue_followup"]);

      getState().record("question", ["noflag_answer"]);
      expect(getState().collectedFlags("question")).toEqual([]);
      expect(getState().upcomingCardIds()).toEqual(["noflag_followup"]);
    });
  });

  describe("data.visible", () => {
    test("shows result if visible: true", () => {
      setState({
        flow: {
          _root: {
            edges: ["result"],
          },
          result: {
            type: TYPES.Result,
            data: {
              visible: true,
              fn: "flag",
            },
            edges: ["red_flag", "blue_flag"],
          },
          red_flag: {
            type: TYPES.Response,
            data: {
              val: "red",
            },
          },
          blue_flag: {
            type: TYPES.Response,
            data: {
              val: "blue",
            },
          },
        },
      });

      expect(getState().upcomingCardIds()).toEqual(["result"]);

      getState().record("result", []);

      expect(getState().upcomingCardIds()).toEqual([]);
    });

    test("it jumps past result if visible: false", () => {
      setState({
        flow: {
          _root: {
            edges: ["result"],
          },
          result: {
            type: TYPES.Result,
            data: {
              visible: false,
              fn: "flag",
            },
            edges: ["red_flag", "blue_flag"],
          },
          red_flag: {
            type: TYPES.Response,
            data: {
              val: "red",
            },
          },
          blue_flag: {
            type: TYPES.Response,
            data: {
              val: "blue",
            },
          },
        },
      });

      expect(getState().upcomingCardIds()).toEqual([]);
    });
  });
});
