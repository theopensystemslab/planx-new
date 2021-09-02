import { TYPES } from "@planx/components/types";

import { Store, vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

const flow: Store.flow = {
  _root: {
    edges: ["whatisit"],
  },
  whatisit: {
    type: TYPES.Statement,
    edges: ["food", "tool"],
    data: {
      fn: "item",
    },
  },
  food: {
    type: TYPES.Response,
    data: {
      val: "food",
    },
    edges: ["whichfood"],
  },
  tool: {
    type: TYPES.Response,
    data: {
      val: "tool",
    },
  },
  whichfood: {
    type: TYPES.Statement,
    edges: ["fruit", "cake"],
    data: {
      fn: "item",
    },
  },
  fruit: {
    type: TYPES.Response,
    data: {
      val: "food.fruit",
    },
  },
  cake: {
    type: TYPES.Response,
    data: {
      val: "food.cake",
    },
  },
};

describe("starting a flow with no initial data", () => {
  beforeEach(() => {
    getState().resetPreview();
    setState({ flow });

    getState().record("whatisit", { answers: ["food"] });
  });

  describe("after visiting whatisit->food", () => {
    it("collected the correct passport data", () => {
      expect(getState().computePassport()).toEqual({
        data: { item: ["food"] },
      });
    });

    it("expects to visit 'whichfood' next", () => {
      expect(getState().upcomingCardIds()).toEqual(["whichfood"]);
    });

    describe("and then whichfood->fruit", () => {
      beforeEach(() => getState().record("whichfood", { answers: ["fruit"] }));

      it("overwrites 'food' with 'food.fruit' (more granular data)", () => {
        expect(getState().computePassport()).toEqual({
          data: { item: ["food.fruit"] },
        });
      });

      it("resets the passport data when going back to 'whichfood'", () => {
        getState().record("whichfood");
        expect(getState().upcomingCardIds()).toEqual(["whichfood"]);
        expect(getState().computePassport()).toEqual({
          data: { item: ["food"] },
        });
      });
    });
  });
});
