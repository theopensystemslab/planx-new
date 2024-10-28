import { Store, useStore } from "../../store";

const { getState, setState } = useStore;
const { resetPreview, autoAnswerableFlag } = getState();

beforeEach(() => {
  resetPreview();
});

describe("Returns undefined and does not auto-answer any flag paths", () => {
  test("If the node is not a Filter type", () => {
    setState({ flow: {
        "_root": { "edges": ["SetValue"] },
        "SetValue": { "type": 380, "data": { "fn": "projectType", "val": "alter", "operation": "replace" } },
    }});

    expect(autoAnswerableFlag("SetValue")).not.toBeDefined();
  });

  test("If the node does not set a `fn`", () => {
    const alteredFlow = structuredClone(flowWithFilter);
    delete alteredFlow["Filter"].data?.fn;
    setState({ flow: alteredFlow });

    expect(autoAnswerableFlag("Filter")).not.toBeDefined();
  });

  test("If the node does not have any flag paths (aka options)");
    const alteredFlow = structuredClone(flowWithFilter);
    delete alteredFlow["Filter"].edges;
    setState({ flow: alteredFlow });

    expect(autoAnswerableFlag("Filter")).not.toBeDefined();
});

describe("Filters", () => {
  test.todo("Auto-answer the single highest order flag path when many flags are collected");

  test.todo("Auto-answer the blank path (no flag result) when no matching flags have been collected");
});

const flowWithFilter: Store.Flow = {
  "_root": {
      "edges": [
          "Filter"
      ]
  },
  "Filter": {
      "type": 500,
      "data": {
          "fn": "flag",
          "category": "Material change of use"
      },
      "edges": [
          "Flag1",
          "Flag2",
          "Flag3"
      ]
  },
  "Flag1": {
      "type": 200,
      "data": {
          "text": "Material change of use",
          "val": "MCOU_TRUE"
      }
  },
  "Flag2": {
      "type": 200,
      "data": {
          "text": "Not material change of use",
          "val": "MCOU_FALSE"
      }
  },
  "Flag3": {
      "type": 200,
      "data": {
          "text": "No flag result"
      }
  }
};
