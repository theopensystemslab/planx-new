import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

describe("storing breadcrumbs", () => {
  describe("human decisions", () => {
    test("single choice", () => {
      setState({
        flow: {
          _root: {
            edges: ["first_question"],
          },
          first_question: {
            type: TYPES.Statement,
            edges: ["option_a", "option_b"],
          },
          option_a: {
            type: TYPES.Response,
          },
          option_b: {
            type: TYPES.Response,
          },
        },
      });

      getState().record("first_question", ["option_a"]);

      expect(getState().breadcrumbs).toEqual({
        first_question: {
          answers: ["option_a"],
          auto: false,
        },
      });
    });
  });
});
