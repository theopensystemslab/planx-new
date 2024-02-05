import { TYPES } from "@planx/components/types";

import { vanillaStore } from "../../store";
import { Store } from './../../store/index';

const { getState, setState } = vanillaStore;
const { record } = getState();

test("record() captures state in breadcrumbs", () => {
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
        type: TYPES.Response,
        edges: ["d"],
      },
      d: {
        type: TYPES.Statement,
        edges: ["e", "f"],
      },
      e: { type: TYPES.Response },
      f: { type: TYPES.Response },
    },
  });

  const state: Store.NodeState = {
    type: TYPES.Statement, someStateData: { hello: "world", number: 42, isLive: true, deepObject: { hello: "again" } }
  };

  const data: Store.userData = { data: { projectType: "extension" } };

  record("a", { answers: ["c"], data, state });

  // State captured in breadcrumbs
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false, data, state },
  });

  // State not captured in passport
  expect(getState().computePassport()).toEqual({ data });
});
