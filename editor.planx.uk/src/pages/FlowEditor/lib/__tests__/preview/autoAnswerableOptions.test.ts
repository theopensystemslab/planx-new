import { useStore } from "../../store";

const { getState, setState } = useStore;
const { resetPreview, autoAnswerableOptions } = getState();

beforeEach(() => {
  resetPreview();
});

// Find additional auto-answering tests at:
//   - src/pages/FlowEditor/lib/automations.blanks.test.ts
//   - src/pages/FlowEditor/lib/automations.parentChild.test.ts

describe("Returns undefined and does not auto-answer any options", () => {
  test("If the node is not a Question or Checklist type", () => {
    setState({
      flow: {
        "_root": { "edges": ["SetValue"] },
        "SetValue": { "type": 380, "data": { "fn": "projectType", "val": "alter", "operation": "replace" } },
      },
    });

    expect(autoAnswerableOptions("SetValue")).not.toBeDefined();
  });

  test.todo("If the node is a 'sticky note' Question without edges");

  test.todo("If the node does not set a `fn`");

  test.todo("If we've never seen another node with this `fn` before");
});

describe("Questions", () => {
  test.todo("Auto-answer the option that exactly matches a passport value");

  test.todo("Auto-answer the less granular option when there's a single more granular passport value and no more granular options available");

  test.todo("Auto-answer the single most granular, left-most option when there are many matching passport values");

  test.todo("Auto-answer through the blank path when we have seen this node `fn` but there are no matching passport values");

  test.todo("Auto-answer through the blank path when we have not seen this node `fn` but we have seen all possible option `val`");
});

describe("Checklists", () => {
  test.todo("Auto-answer all options that exactly match passport values");

  test.todo("Auto-answer all less granular options when there are more granular passport values and not more granular options available");

  test.todo("Auto-answer through the blank path when we have seen this node `fn` but there are no matching passport values");

  test.todo("Auto-answer through the blank path when we have not seen this node `fn` but we have seen all possible option `val`");
});
