import { ComponentType } from "@opensystemslab/planx-core/types";

import { Store, useStore } from "../../store";
import { clickContinue, visitedNodes } from "../utils";

const { getState, setState } = useStore;
const { resetPreview, upcomingCardIds } = getState();

describe("Navigation", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow });
  });

  test("It navigates forwards in the expected order", () => {
    expect(upcomingCardIds()).toEqual(["RootQuestion", "FinalNotice"]);

    // Answer the first question
    clickContinue("RootQuestion", { auto: false, answers: ["RightPath"] });
    // The clone has been incorrectly hoisted from the left branch into first position
    expect(upcomingCardIds()).toEqual([
      "ClonedSetValue",
      "RightPathFirstQuestion",
      "FinalNotice",
    ]);

    // Automate the SetValue and answer the next question
    clickContinue("ClonedSetValue", { auto: true });
    clickContinue("RightPathFirstQuestion", {
      auto: false,
      answers: ["FbbUQsAXnS"],
    });

    // This is our "forwards" order that we expect to be able to go "back" through in reverse
    const forwardsSequence = [
      "RootQuestion",
      "ClonedSetValue",
      "RightPathFirstQuestion",
      "ClonedContent",
      "FinalNotice",
    ];
    expect(visitedNodes().concat(upcomingCardIds())).toEqual(forwardsSequence);

    // In a future where clones are fixed, forwards order _should_ be:
    // ["RootQuestion", "RightPathFirstQuestion", "ClonedContent", "ClonedSetValue", "FinalNotice"]
  });

  test.todo("It navigates backwards in the same order");
});

// https://editor.planx.uk/app/testing/backwards-navigation
const flow: Store.Flow = {
  _root: {
    edges: ["RootQuestion", "FinalNotice"],
  },
  RootQuestion: {
    data: {
      tags: [],
      text: "What do you want to do?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: ComponentType.Question,
    edges: ["LeftPath", "RightPath"],
  },
  LeftPathFirstQuestion: {
    data: {
      fn: "proposal.projectType",
      text: "How will the outbuildings be used?",
      allRequired: false,
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
      tags: [],
    },
    type: ComponentType.Checklist,
    edges: ["Y4PpSxv4QQ", "Yger8jnqr8"],
  },
  FbbUQsAXnS: {
    data: {
      val: "false",
      text: "Building",
    },
    type: ComponentType.Answer,
    edges: ["ClonedContent"],
  },
  ClonedContent: {
    data: {
      content:
        "<h1>Cloned folder proxy</h1><p>Is it an incidental residential annexe or a new residential unit?</p><p></p>",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  Jq48bumSEw: {
    data: {
      text: "Outside the garden of the house",
    },
    type: ComponentType.Answer,
  },
  RightPathSecondQuestion: {
    data: {
      text: "Where will the caravan be sited?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: ComponentType.Question,
    edges: ["zbE3thVeTe", "Jq48bumSEw"],
  },
  LeftPath: {
    data: {
      text: "Change how outbuildings are used",
    },
    type: ComponentType.Answer,
    edges: ["LeftPathFirstQuestion"],
  },
  RightPath: {
    data: {
      text: "Site a caravan",
    },
    type: ComponentType.Answer,
    edges: ["RightPathFirstQuestion", "ClonedSetValue"],
  },
  Y4PpSxv4QQ: {
    data: {
      val: "changeOfUse.let.part",
      text: "Long term residence",
    },
    type: ComponentType.Answer,
    edges: ["ClonedContent", "ClonedSetValue"],
  },
  Yger8jnqr8: {
    data: {
      val: "changeOfUse.outbuilding",
      text: "Something else",
    },
    type: ComponentType.Answer,
  },
  ClonedSetValue: {
    data: {
      fn: "proposal.meansOfAccess",
      val: "true",
      operation: "append",
    },
    type: ComponentType.SetValue,
  },
  ogQZmifptv: {
    data: {
      val: "true",
      text: "Caravan",
    },
    type: ComponentType.Answer,
    edges: ["RightPathSecondQuestion"],
  },
  RightPathFirstQuestion: {
    data: {
      fn: "proposal.caravan.building",
      text: "Is it a building or a caravan?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: ComponentType.Question,
    edges: ["FbbUQsAXnS", "ogQZmifptv"],
  },
  zbE3thVeTe: {
    data: {
      text: "Within the garden or driveway",
    },
    type: ComponentType.Answer,
    edges: ["ClonedContent"],
  },
  FinalNotice: {
    type: ComponentType.Notice,
    data: {
      title: "End of test",
      color: "#EFEFEF",
      resetButton: true,
    },
  },
};
