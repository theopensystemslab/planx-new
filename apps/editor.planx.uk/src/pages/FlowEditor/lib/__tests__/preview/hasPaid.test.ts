import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { useStore } from "../../store";

const { getState, setState } = useStore;
const { record, hasPaid } = getState();

test("hasPaid is updated if a Pay component has been recorded", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Question,
        edges: ["c"],
      },
      b: {
        type: TYPES.Question,
      },
      c: {
        type: TYPES.Pay,
      },

      d: { type: TYPES.Answer },
      e: { type: TYPES.Review },
    },
  });

  record("a", { answers: ["c"] });
  expect(hasPaid()).toBe(false);

  record("c", {});
  expect(getState().breadcrumbs).toEqual({
    a: {
      answers: ["c"],
      auto: false,
      createdAt: expect.any(String),
      seq: expect.any(Number),
    },
    c: {
      auto: false,
      createdAt: expect.any(String),
      seq: expect.any(Number),
    },
  });

  expect(hasPaid()).toBe(true);
});
