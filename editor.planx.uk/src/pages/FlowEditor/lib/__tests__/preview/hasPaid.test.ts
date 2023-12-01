import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../../store";

const { getState, setState } = vanillaStore;
const { record, hasPaid } = getState();

test("hasPaid is updated if a Pay component has been recorded", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Statement,
        edges: ["c"],
      },
      b: {
        type: TYPES.Statement,
      },
      c: {
        type: TYPES.Pay,
      },

      d: { type: TYPES.Response },
      e: { type: TYPES.Review },
    },
  });

  record("a", { answers: ["c"] });
  expect(hasPaid()).toBe(false);

  record("c", {});
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false },
    c: { auto: false },
  });

  expect(hasPaid()).toBe(true);
});
