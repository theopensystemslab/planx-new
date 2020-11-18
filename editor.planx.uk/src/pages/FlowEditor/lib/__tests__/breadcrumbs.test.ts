import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

describe("storing breadcrumbs", () => {
  describe("human decisions", () => {
    beforeEach(() => {
      setState({
        flow: {
          _root: {
            edges: ["i_want_to"],
          },
          i_want_to: {
            type: TYPES.Statement,
            edges: ["demolish", "extend"],
            data: {
              fn: "proposal.projectType",
            },
          },
          demolish: {
            type: TYPES.Response,
            edges: ["q1a1q1", "q1a1q2"],
            data: {
              val: "demolish",
            },
          },
          extend: {
            type: TYPES.Response,
            data: {
              val: "extend",
            },
          },
        },
      });
    });

    test("single choice", () => {
      getState().record("i_want_to", ["demolish"]);

      expect(getState().breadcrumbs).toEqual({
        i_want_to: {
          answers: ["demolish"],
          auto: false,
        },
      });

      expect(getState().passport).toEqual({
        data: {
          "proposal.projectType": {
            value: ["demolish"],
          },
        },
      });
    });

    test("multiple choice", () => {
      getState().record("i_want_to", ["demolish", "extend"]);

      expect(getState().breadcrumbs).toEqual({
        i_want_to: {
          answers: ["demolish", "extend"],
          auto: false,
        },
      });

      expect(getState().passport).toEqual({
        data: {
          "proposal.projectType": {
            value: ["demolish", "extend"],
          },
        },
      });
    });
  });
});
