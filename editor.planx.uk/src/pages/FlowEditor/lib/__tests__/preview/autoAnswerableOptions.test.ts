import { Store, useStore } from "../../store";
import { clickContinue } from "../utils";

const { getState, setState } = useStore;
const { resetPreview, autoAnswerableOptions, computePassport } = getState();

// Find additional auto-answering tests at:
//   - src/pages/FlowEditor/lib/automations.blanks.test.ts
//   - src/pages/FlowEditor/lib/automations.parentChild.test.ts
//   - src/pages/FlowEditor/lib/automations.planningConstraintNots.test.ts
//   - src/pages/FlowEditor/lib/automations.setValue.test.ts

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

describe("Questions and Checklists", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow });
  });

  test("Auto-answer the option that exactly matches a passport value", () => {
    clickContinue("InitialChecklistFood", { answers: ["InitialChecklistOptionFruit"], auto: false });
    expect(computePassport()?.data).toEqual({ "foods": ["fruit"] });

    expect(autoAnswerableOptions("QuestionFruit")).toEqual(["QuestionFruitYesOption"]);
  });

  test("Auto-answer the less granular option when there's a single more granular passport value and no more granular options available", () => {
    clickContinue("InitialChecklistFood", { answers: ["InitialChecklistOptionFruit"], auto: false });
    expect(computePassport()?.data).toEqual({ "foods": ["fruit"] });

    // Answer a followup question and confirm passport only stores most granular value
    clickContinue("QuestionFruitType", { answers: ["OptionFruitTypeRedGrapes"], auto: false });
    expect(computePassport()?.data).toEqual({ "foods": ["fruit.grapes.red"] });

    expect(autoAnswerableOptions("QuestionFruitTypeLessGranular")).toEqual(["OptionFruitTypeLessGranularGrapes"]);
  });

  test("Puts to user when we have seen this node `fn`, we do not have passport vals, and we have NOT seen all possible option `val`", () => {
    clickContinue("InitialChecklistFood", { answers: ["InitialChecklistOptionBlank"], auto: false });
    expect(computePassport()?.data).toEqual({});

    expect(autoAnswerableOptions("QuestionChocolate")).toBeUndefined();
  });

  test("Auto-answers when we have seen this node `fn`, we have passport vals but not matching ones, and we have NOT seen all possible option `val`", () => {
    clickContinue("InitialChecklistFood", { answers: ["InitialChecklistOptionFruit"], auto: false });
    expect(computePassport()?.data).toEqual({ "foods": ["fruit"] });

    expect(autoAnswerableOptions("QuestionChocolate")).toEqual(["QuestionChocolateOptionBlank"]);
  });

  test.todo("Auto-answer the single most granular, left-most option when there are many matching passport values");
});

const flow: Store.Flow = {
  "_root": {
    "edges": [
      "InitialChecklistFood",
      "QuestionChocolate",
      "QuestionFruit",
      "QuestionRyeBread",
      "LastChecklistFood"
    ]
  },
  "OptionFruitTypeGreenGrapes": {
    "data": {
      "val": "fruit.grapes.green",
      "text": "Green grapes"
    },
    "type": 200
  },
  "QuestionChocolateOptionYes": {
    "data": {
      "val": "chocolate",
      "text": "Yes"
    },
    "type": 200
  },
  "LastChecklistOptionBread": {
    "data": {
      "val": "bread",
      "text": "Bread"
    },
    "type": 200
  },
  "InitialChecklistOptionBread": {
    "data": {
      "val": "bread",
      "text": "Bread"
    },
    "type": 200,
    "edges": [
      "QuestionBreadType"
    ]
  },
  "QuestionBreadType": {
    "data": {
      "fn": "foods",
      "tags": [],
      "text": "Which bread?",
      "neverAutoAnswer": false
    },
    "type": 100,
    "edges": [
      "OptionBreadTypeBagel",
      "OptionBreadTypeSourdough"
    ]
  },
  "OptionBreadTypeSourdough": {
    "data": {
      "val": "bread.sourdough",
      "text": "Sourdough"
    },
    "type": 200
  },
  "OptionFruitTypeRedGrapes": {
    "data": {
      "val": "fruit.grapes.red",
      "text": "Red grapes"
    },
    "type": 200
  },
  "OptionFruitTypeLessGranularBlank": {
    "data": {
      "text": "Another kind of fruit"
    },
    "type": 200
  },
  "OptionBreadTypeBagel": {
    "data": {
      "val": "bread.bagel",
      "text": "Bagel"
    },
    "type": 200
  },
  "LastChecklistOptionBlank": {
    "data": {
      "text": "None"
    },
    "type": 200
  },
  "QuestionRyeBread": {
    "data": {
      "fn": "foods",
      "text": "Do you have rye bread?"
    },
    "type": 100,
    "edges": [
      "OptionRyeBreadYes",
      "OptionRyeBreadBlank"
    ]
  },
  "QuestionFruit": {
    "data": {
      "fn": "foods",
      "text": "Do you have fruit?"
    },
    "type": 100,
    "edges": [
      "QuestionFruitYesOption",
      "QuestionFruitBlankOption"
    ]
  },
  "LastChecklistOptionFruit": {
    "data": {
      "val": "fruit",
      "text": "Fruit"
    },
    "type": 200
  },
  "OptionRyeBreadBlank": {
    "data": {
      "text": "No"
    },
    "type": 200
  },
  "QuestionFruitYesOption": {
    "data": {
      "val": "fruit",
      "text": "Yes"
    },
    "type": 200,
    "edges": [
      "QuestionFruitTypeLessGranular"
    ]
  },
  "InitialChecklistFood": {
    "data": {
      "fn": "foods",
      "tags": [],
      "text": "Which foods do you want?",
      "allRequired": false,
      "neverAutoAnswer": false
    },
    "type": 105,
    "edges": [
      "InitialChecklistOptionFruit",
      "InitialChecklistOptionBread",
      "InitialChecklistOptionBlank"
    ]
  },
  "OptionRyeBreadYes": {
    "data": {
      "val": "bread.rye",
      "text": "Yes"
    },
    "type": 200
  },
  "OptionFruitTypeBanana": {
    "data": {
      "val": "fruit.bananas",
      "text": "Bananas"
    },
    "type": 200
  },
  "QuestionChocolateOptionBlank": {
    "data": {
      "text": "No"
    },
    "type": 200
  },
  "LastChecklistFood": {
    "data": {
      "fn": "foods",
      "tags": [],
      "text": "Which do you have?",
      "allRequired": false
    },
    "type": 105,
    "edges": [
      "LastChecklistOptionFruit",
      "LastChecklistOptionBread",
      "LastChecklistOptionChocolate",
      "LastChecklistOptionBlank"
    ]
  },
  "QuestionChocolate": {
    "data": {
      "fn": "foods",
      "tags": [],
      "text": "Do you have chocolate?",
      "neverAutoAnswer": false
    },
    "type": 100,
    "edges": [
      "QuestionChocolateOptionYes",
      "QuestionChocolateOptionBlank"
    ]
  },
  "LastChecklistOptionChocolate": {
    "data": {
      "val": "chocolate",
      "text": "Chocolate"
    },
    "type": 200
  },
  "QuestionFruitBlankOption": {
    "data": {
      "text": "No"
    },
    "type": 200
  },
  "InitialChecklistOptionFruit": {
    "data": {
      "val": "fruit",
      "text": "Fruit"
    },
    "type": 200,
    "edges": [
      "QuestionFruitType"
    ]
  },
  "OptionFruitTypeLessGranularGrapes": {
    "data": {
      "val": "fruit.grapes",
      "text": "Grapes"
    },
    "type": 200
  },
  "QuestionFruitTypeLessGranular": {
    "data": {
      "fn": "foods",
      "tags": [],
      "text": "Which kind of fruit do you have?",
      "neverAutoAnswer": false
    },
    "type": 100,
    "edges": [
      "OptionFruitTypeLessGranularGrapes",
      "OptionFruitTypeLessGranularBlank"
    ]
  },
  "InitialChecklistOptionBlank": {
    "data": {
      "text": "None of these"
    },
    "type": 200
  },
  "QuestionFruitType": {
    "data": {
      "fn": "foods",
      "tags": [],
      "text": "Which fruit?",
      "neverAutoAnswer": false
    },
    "type": 100,
    "edges": [
      "OptionFruitTypeBanana",
      "OptionFruitTypeRedGrapes",
      "OptionFruitTypeGreenGrapes"
    ]
  }
};

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
      "neverAutoAnswer": false
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