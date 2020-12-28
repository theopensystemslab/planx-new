import { TYPES } from "@planx/components/types";
import shuffle from "lodash/shuffle";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
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

describe("Ok, quite a bit less basic now", () => {
  [
    ["food.fruit", "food.fruit"],
    ["food.dairy", "food"],
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
            edges: ["food.fruit", "food", "other"],
          },
          "food.fruit": {
            type: TYPES.Response,
            data: { val: "food.fruit" },
          },
          food: {
            type: TYPES.Response,
            data: { val: "food" },
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

describe("advanced automations", () => {
  const data: Array<[string[], string]> = [
    [["food.fruit.banana"], "neither_apples_nor_bread"],

    [["food.bread"], "bread"],

    [["food.fruit.apple"], "apples"],

    [["food.fruit.apple", "food.fruit.banana"], "apples"],
    [["food.fruit.apple", "food.bread"], "apples_and_bread"],

    [
      ["food.fruit.apple", "food.fruit.banana", "food.bread"],
      "apples_and_bread",
    ],

    [["food.fruit.banana", "food.bread"], "bread"],
  ];
  data.forEach(([item, expected]: [string[], string]) => {
    test([item.join(" + "), expected].join(" = "), () => {
      setState({
        passport: {
          data: {
            item: {
              value: shuffle(item),
            },
          },
        },
        flow: {
          _root: {
            edges: ["contains"],
          },
          contains: {
            type: TYPES.Statement,
            data: { fn: "item" },
            edges: shuffle([
              "apples",
              "bread",
              "apples_and_bread",
              "neither_apples_nor_bread",
            ]),
          },
          apples: {
            type: TYPES.Response,
            data: { val: "food.fruit.apple" },
          },
          bread: {
            type: TYPES.Response,
            data: { val: "food.bread" },
          },
          apples_and_bread: {
            type: TYPES.Response,
            data: { val: "food.fruit.apple,food.bread" },
          },
          neither_apples_nor_bread: {
            type: TYPES.Response,
          },
        },
      });

      getState().upcomingCardIds();

      expect(getState().breadcrumbs).toEqual({
        contains: {
          answers: [expected],
          auto: true,
        },
      });
    });
  });
});
