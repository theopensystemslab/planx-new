import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

test("thing", () => {
  setState({
    passport: {
      data: {
        animal: {
          value: ["dog"],
        },
      },
    },
    flow: {
      _root: {
        edges: ["section"],
      },
      section: {
        type: TYPES.PageWithSections,
        edges: ["animal_page"],
      },
      animal_page: {
        type: TYPES.Page,
        edges: ["animal", "foo"],
      },
      animal: {
        type: TYPES.Statement,
        data: { fn: "animal" },
        edges: ["dog", "cat"],
      },
      dog: {
        type: TYPES.Response,
        data: { val: "dog" },
        edges: ["its_a_dog"],
      },
      cat: {
        type: TYPES.Response,
        data: { val: "cat" },
        edges: ["its_a_cat"],
      },
      its_a_dog: {
        type: TYPES.Content,
      },
      its_a_cat: {
        type: TYPES.Content,
      },
      foo: {
        type: TYPES.Content,
      },
    },
  });

  expect(getState().dfs("animal_page")).toEqual(["its_a_dog", "foo"]);

  setState({
    passport: {
      data: {
        animal: {
          value: ["cat"],
        },
      },
    },
  });

  expect(getState().dfs("animal_page")).toEqual(["its_a_cat", "foo"]);

  setState({
    passport: {},
  });
  expect(getState().dfs("animal_page")).toEqual(["animal", "foo"]);
});
