import { Store, useStore } from "../store";
import { clickContinue } from "./utils";

const { getState, setState } = useStore;
const {
  resetPreview,
  upcomingCardIds,
  autoAnswerableOptions,
  computePassport,
} = getState();

describe("Auto-answering based on a SetValue", () => {
  beforeEach(() => {
    resetPreview();
  });

  test("Questions and Checklists auto-answer the correct paths", () => {
    setState({ flow });
    expect(upcomingCardIds()).toEqual([
      "SetValueChocolate",
      "InitialChecklistFood",
      "QuestionChocolate",
      "QuestionFruit",
      "QuestionRyeBread",
      "LastChecklistFood",
    ]);

    // Proceed through SetValue
    clickContinue("SetValueChocolate", {
      data: { food: ["chocolate"] },
      auto: true,
    });
    expect(computePassport()?.data).toHaveProperty("food");

    // Confirm all upcoming cards are auto-answerable
    expect(autoAnswerableOptions("InitialChecklistFood")).toEqual([
      "InitialChecklistOptionBlank",
    ]);
    expect(autoAnswerableOptions("QuestionChocolate")).toEqual([
      "QuestionChocolateOptionYes",
    ]);
    expect(autoAnswerableOptions("QuestionFruit")).toEqual([
      "QuestionFruitOptionBlank",
    ]);
    expect(autoAnswerableOptions("QuestionRyeBread")).toEqual([
      "OptionRyeBreadBlank",
    ]);
    expect(autoAnswerableOptions("LastChecklistFood")).toEqual([
      "LastChecklistOptionChocolate",
    ]);
  });

  test("A node using the `neverAutoAnswer` prop is not auto-answered and put to the user", () => {
    const alteredFlow = structuredClone(flow);
    Object.assign(alteredFlow, {
      InitialChecklistFood: {
        data: {
          fn: "foods",
          tags: [],
          text: "Which foods do you want?",
          allRequired: false,
          neverAutoAnswer: true, // toggled to `true`
        },
        type: 105,
        edges: [
          "InitialChecklistOptionFruit",
          "InitialChecklistOptionBread",
          "InitialChecklistOptionBlank",
        ],
      },
    });
    setState({ flow: alteredFlow });
    expect(upcomingCardIds()?.[0]).toEqual("SetValueChocolate");

    // Proceed through SetValue
    clickContinue("SetValueChocolate", {
      data: { foods: ["chocolate"] },
      auto: true,
    });
    expect(computePassport()?.data).toHaveProperty("foods");

    // Confirm that the `neverAutoAnswer` Checklist is not auto-answerable and manually proceed through
    expect(autoAnswerableOptions("InitialChecklistFood")).toBeUndefined();
    clickContinue("InitialChecklistFood", {
      answers: ["InitialChecklistOptionBread"],
      auto: false,
    });
    expect(computePassport()?.data).toEqual({ foods: ["bread", "chocolate"] });

    // The followup Question only has options that are more granular than our passport values so it is put to the user
    expect(upcomingCardIds()?.[0]).toEqual("QuestionBreadType");
    expect(autoAnswerableOptions("QuestionBreadType")).toBeUndefined();
    clickContinue("QuestionBreadType", {
      answers: ["OptionBreadTypeBagel"],
      auto: false,
    });

    // Confirm all upcoming cards are auto-answerable
    expect(autoAnswerableOptions("QuestionChocolate")).toEqual([
      "QuestionChocolateOptionYes",
    ]);
    expect(autoAnswerableOptions("QuestionFruit")).toEqual([
      "QuestionFruitOptionBlank",
    ]);
    expect(autoAnswerableOptions("QuestionRyeBread")).toEqual([
      "OptionRyeBreadBlank",
    ]);
    expect(autoAnswerableOptions("LastChecklistFood")).toEqual([
      "LastChecklistOptionBread",
      "LastChecklistOptionChocolate",
    ]);
  });
});

const flow: Store.Flow = {
  _root: {
    edges: [
      "SetValueChocolate",
      "InitialChecklistFood",
      "QuestionChocolate",
      "QuestionFruit",
      "QuestionRyeBread",
      "LastChecklistFood",
    ],
  },
  OptionFruitTypeGreenGrapes: {
    data: {
      val: "fruit.grapes.green",
      text: "Green grapes",
    },
    type: 200,
  },
  QuestionChocolateOptionYes: {
    data: {
      val: "chocolate",
      text: "Yes",
    },
    type: 200,
  },
  LastChecklistOptionBread: {
    data: {
      val: "bread",
      text: "Bread",
    },
    type: 200,
  },
  InitialChecklistOptionBread: {
    data: {
      val: "bread",
      text: "Bread",
    },
    type: 200,
    edges: ["QuestionBreadType"],
  },
  QuestionBreadType: {
    data: {
      fn: "foods",
      tags: [],
      text: "Which bread?",
      neverAutoAnswer: false,
    },
    type: 100,
    edges: ["OptionBreadTypeBagel", "OptionBreadTypeSourdough"],
  },
  OptionBreadTypeSourdough: {
    data: {
      val: "bread.sourdough",
      text: "Sourdough",
    },
    type: 200,
  },
  OptionFruitTypeRedGrapes: {
    data: {
      val: "fruit.grapes.red",
      text: "Red grapes",
    },
    type: 200,
  },
  OptionFruitTypeLessGranularBlank: {
    data: {
      text: "Another kind of fruit",
    },
    type: 200,
  },
  OptionBreadTypeBagel: {
    data: {
      val: "bread.bagel",
      text: "Bagel",
    },
    type: 200,
  },
  LastChecklistOptionBlank: {
    data: {
      text: "None",
    },
    type: 200,
  },
  QuestionRyeBread: {
    data: {
      fn: "foods",
      text: "Do you have rye bread?",
    },
    type: 100,
    edges: ["OptionRyeBreadYes", "OptionRyeBreadBlank"],
  },
  QuestionFruit: {
    data: {
      fn: "foods",
      text: "Do you have fruit?",
    },
    type: 100,
    edges: ["QuestionFruitOptionYes", "QuestionFruitOptionBlank"],
  },
  LastChecklistOptionFruit: {
    data: {
      val: "fruit",
      text: "Fruit",
    },
    type: 200,
  },
  SetValueChocolate: {
    data: {
      fn: "foods",
      val: "chocolate",
      operation: "append",
    },
    type: 380,
  },
  OptionRyeBreadBlank: {
    data: {
      text: "No",
    },
    type: 200,
  },
  QuestionFruitOptionYes: {
    data: {
      val: "fruit",
      text: "Yes",
    },
    type: 200,
    edges: ["QuestionFruitTypeLessGranular"],
  },
  InitialChecklistFood: {
    data: {
      fn: "foods",
      tags: [],
      text: "Which foods do you want?",
      allRequired: false,
      neverAutoAnswer: false,
    },
    type: 105,
    edges: [
      "InitialChecklistOptionFruit",
      "InitialChecklistOptionBread",
      "InitialChecklistOptionBlank",
    ],
  },
  OptionRyeBreadYes: {
    data: {
      val: "bread.rye",
      text: "Yes",
    },
    type: 200,
  },
  OptionFruitTypeBanana: {
    data: {
      val: "fruit.bananas",
      text: "Bananas",
    },
    type: 200,
  },
  QuestionChocolateOptionBlank: {
    data: {
      text: "No",
    },
    type: 200,
  },
  LastChecklistFood: {
    data: {
      fn: "foods",
      tags: [],
      text: "Which do you have?",
      allRequired: false,
    },
    type: 105,
    edges: [
      "LastChecklistOptionFruit",
      "LastChecklistOptionBread",
      "LastChecklistOptionChocolate",
      "LastChecklistOptionBlank",
    ],
  },
  QuestionChocolate: {
    data: {
      fn: "foods",
      tags: [],
      text: "Do you have chocolate?",
      neverAutoAnswer: false,
    },
    type: 100,
    edges: ["QuestionChocolateOptionYes", "QuestionChocolateOptionBlank"],
  },
  LastChecklistOptionChocolate: {
    data: {
      val: "chocolate",
      text: "Chocolate",
    },
    type: 200,
  },
  QuestionFruitOptionBlank: {
    data: {
      text: "No",
    },
    type: 200,
  },
  InitialChecklistOptionFruit: {
    data: {
      val: "fruit",
      text: "Fruit",
    },
    type: 200,
    edges: ["QuestionFruitType"],
  },
  OptionFruitTypeLessGranularGrapes: {
    data: {
      val: "fruit.grapes",
      text: "Grapes",
    },
    type: 200,
  },
  QuestionFruitTypeLessGranular: {
    data: {
      fn: "foods",
      tags: [],
      text: "Which kind of fruit do you have?",
      neverAutoAnswer: false,
    },
    type: 100,
    edges: [
      "OptionFruitTypeLessGranularGrapes",
      "OptionFruitTypeLessGranularBlank",
    ],
  },
  InitialChecklistOptionBlank: {
    data: {
      text: "None of these",
    },
    type: 200,
  },
  QuestionFruitType: {
    data: {
      fn: "foods",
      tags: [],
      text: "Which fruit?",
      neverAutoAnswer: false,
    },
    type: 100,
    edges: [
      "OptionFruitTypeBanana",
      "OptionFruitTypeRedGrapes",
      "OptionFruitTypeGreenGrapes",
    ],
  },
};
