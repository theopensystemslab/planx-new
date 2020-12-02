import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

describe("basic behaviour", () => {
  ["food", "cosmetics", "other"].forEach((item) => {
    test(item, () => {
      setState({
        passport: {
          data: {
            item: {
              value: [item],
            },
          },
        },
        flow: {
          _root: {
            edges: ["item"],
          },
          item: {
            type: TYPES.Statement,
            data: { fn: "item" },
            edges: ["food", "cosmetics", "other"],
          },
          food: {
            type: TYPES.Response,
            data: { val: "food" },
          },
          cosmetics: {
            type: TYPES.Response,
            data: { val: "cosmetics" },
          },
          other: {
            type: TYPES.Response,
          },
        },
      });

      getState().upcomingCardIds();

      expect(getState().breadcrumbs).toEqual({
        item: {
          answers: [item],
          auto: true,
        },
      });
    });
  });
});

describe("less basic behaviour", () => {
  [
    ["food.fruit", "food"],
    ["hardware", "hardware"],
    ["stationary", "other"],
  ].forEach(([item, expected]) => {
    test(item, () => {
      setState({
        passport: {
          data: {
            item: {
              value: [item],
            },
          },
        },
        flow: {
          _root: {
            edges: ["item"],
          },
          item: {
            type: TYPES.Statement,
            data: { fn: "item" },
            edges: ["food", "hardware", "other"],
          },
          food: {
            type: TYPES.Response,
            data: { val: "food" },
          },
          hardware: {
            type: TYPES.Response,
            data: { val: "hardware" },
          },
          other: {
            type: TYPES.Response,
          },
        },
      });

      getState().upcomingCardIds();

      expect(getState().breadcrumbs).toEqual({
        item: {
          answers: [expected],
          auto: true,
        },
      });
    });
  });
});

describe("somewhat less basic behaviour", () => {
  [
    ["food.fruit", "food.fruit"],
    ["food.vegetables", "other"],
    ["clothes", "other"],
  ].forEach(([item, expected]) => {
    test(item, () => {
      setState({
        passport: {
          data: {
            item: {
              value: [item],
            },
          },
        },
        flow: {
          _root: {
            edges: ["item"],
          },
          item: {
            type: TYPES.Statement,
            data: { fn: "item" },
            edges: ["food.fruit", "other"],
          },
          "food.fruit": {
            type: TYPES.Response,
            data: { val: "food.fruit" },
          },
          other: {
            type: TYPES.Response,
          },
        },
      });

      getState().upcomingCardIds();

      expect(getState().breadcrumbs).toEqual({
        item: {
          answers: [expected],
          auto: true,
        },
      });
    });
  });
});
