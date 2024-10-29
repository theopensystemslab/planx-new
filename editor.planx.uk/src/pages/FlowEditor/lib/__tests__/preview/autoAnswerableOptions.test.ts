import { Store, useStore } from "../../store";

const { getState, setState } = useStore;
const { resetPreview, autoAnswerableOptions } = getState();

// Find additional auto-answering tests at:
//   - src/pages/FlowEditor/lib/automations.blanks.test.ts
//   - src/pages/FlowEditor/lib/automations.parentChild.test.ts
//   - src/pages/FlowEditor/lib/automations.planningConstraintNots.test.ts

describe("Returns undefined and does not auto-answer any options", () => {
  beforeEach(() => {
    resetPreview();
  });
  
  test("If the node is not a Question or Checklist type", () => {
    setState({
      flow: {
        "_root": { "edges": ["SetValue"] },
        "SetValue": { "type": 380, "data": { "fn": "projectType", "val": "alter", "operation": "replace" } },
      },
    });

    expect(autoAnswerableOptions("SetValue")).not.toBeDefined();
  });

  test("If the node is a 'sticky note' Question without edges", () => {
    const alteredFlow = structuredClone(singleNodeFlow);
    delete alteredFlow["Question"]?.edges;
    setState({ flow: alteredFlow });

    expect(autoAnswerableOptions("Question")).not.toBeDefined();
  });

  test("If the node does not set a `fn`", () => {
    const alteredFlow = structuredClone(singleNodeFlow);
    delete alteredFlow["Question"]?.data?.fn;
    setState({ flow: alteredFlow });

    expect(autoAnswerableOptions("Question")).not.toBeDefined();
  });

  test("If we've never seen another node with this `fn` before", () => {
    setState({ 
      flow: singleNodeFlow, 
      breadcrumbs: {} 
    });
    
    expect(autoAnswerableOptions("Question")).not.toBeDefined();
  });
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

const singleNodeFlow: Store.Flow = {
  "_root": {
      "edges": [
          "Question"
      ]
  },
  "Question": {
      "type": 100,
      "data": {
          "fn": "direction",
          "text": "Which direction?",
          "forceSelection": false
      },
      "edges": [
          "Option1",
          "Option2"
      ]
  },
  "Option1": {
      "type": 200,
      "data": {
          "text": "Left",
          "val": "left"
      }
  },
  "Option2": {
      "type": 200,
      "data": {
          "text": "Right",
          "val": "right"
      }
  }
};