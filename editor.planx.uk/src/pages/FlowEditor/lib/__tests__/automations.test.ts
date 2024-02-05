import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import shuffle from "lodash/shuffle";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

describe("(basic) if the passport contains", () => {
  [
    ["food.fruit", "food"],
    ["hardware", "hardware"],
    ["stationary", "other"],
  ].forEach(([item, expected]) => {
    test(`[${item}] it should go down the [${expected}] path`, () => {
      setState({
        flow: {
          _root: {
            edges: ["_setter", "item"],
          },
          _setter: {},
          item: {
            type: TYPES.Question,
            data: { fn: "item" },
            edges: ["food", "hardware", "other"],
          },
          food: {
            type: TYPES.Answer,
            data: { val: "food" },
          },
          hardware: {
            type: TYPES.Answer,
            data: { val: "hardware" },
          },
          other: {
            type: TYPES.Answer,
          },
        },
      });

      const defaultPassportData = {
        data: { item: [item] },
      };
      getState().record("_setter", defaultPassportData);

      getState().upcomingCardIds();

      expect(getState().breadcrumbs).toEqual({
        _setter: {
          auto: false,
          ...defaultPassportData,
        },
        item: {
          answers: [expected],
          auto: true,
        },
      });
    });
  });
});

describe("(more advanced) if the passport contains", () => {
  [
    ["food.fruit", "food.fruit"],
    ["food.dairy", "food"],
    ["clothes", "other"],
  ].forEach(([item, expected]) => {
    test(`[${item}] it should go down the [${expected}] path`, () => {
      setState({
        flow: {
          _root: {
            edges: ["_setter", "item"],
          },
          _setter: {},
          item: {
            type: TYPES.Question,
            data: { fn: "item" },
            edges: ["food.fruit", "food", "other"],
          },
          "food.fruit": {
            type: TYPES.Answer,
            data: { val: "food.fruit" },
          },
          food: {
            type: TYPES.Answer,
            data: { val: "food" },
          },
          other: {
            type: TYPES.Answer,
          },
        },
      });

      const defaultPassportData = {
        data: { item: [item] },
      };
      getState().record("_setter", defaultPassportData);

      getState().upcomingCardIds();

      expect(getState().breadcrumbs).toEqual({
        _setter: {
          auto: false,
          ...defaultPassportData,
        },
        item: {
          answers: [expected],
          auto: true,
        },
      });
    });
  });
});

describe("(advanced) if the passport contains", () => {
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
    test(`[${item.join(
      " & ",
    )}] it should go down the [${expected}] path`, () => {
      setState({
        flow: {
          _root: {
            edges: ["_setter", "contains"],
          },
          _setter: {},
          contains: {
            type: TYPES.Question,
            data: { fn: "item" },
            edges: shuffle([
              "apples",
              "bread",
              "apples_and_bread",
              "neither_apples_nor_bread",
            ]),
          },
          apples: {
            type: TYPES.Answer,
            data: { val: "food.fruit.apple" },
          },
          bread: {
            type: TYPES.Answer,
            data: { val: "food.bread" },
          },
          apples_and_bread: {
            type: TYPES.Answer,
            data: { val: "food.fruit.apple,food.bread" },
          },
          neither_apples_nor_bread: {
            type: TYPES.Answer,
          },
        },
      });

      const defaultPassportData = { data: { item: shuffle(item) } };

      getState().record("_setter", defaultPassportData);

      getState().upcomingCardIds();

      expect(getState().breadcrumbs).toEqual({
        _setter: {
          auto: false,
          ...defaultPassportData,
        },
        contains: {
          answers: [expected],
          auto: true,
        },
      });
    });
  });
});
