import { Store, useStore } from "../store";
import { clickContinue } from "./utils";

const { getState, setState } = useStore;
const {
  upcomingCardIds,
  resetPreview,
  autoAnswerableOptions,
  computePassport,
} = getState();

describe("Parent-child automations and granularity", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow });
  });

  test("Selecting `a` and `a.x` only auto-answers `a.x`", () => {
    // Manually answer the first Checklist
    expect(upcomingCardIds()).toEqual(["Checklist1", "Checklist2", "Question"]);
    clickContinue("Checklist1", {
      answers: ["Checklist1ParentA", "Checklist1ChildAX"],
      auto: false,
    });

    // Only the most granular value is retained in the passport and queued up for auto-answering the subsequent Checklist & Question
    expect(upcomingCardIds()?.[0]).toEqual("Checklist2");
    expect(computePassport()?.data).toEqual({ values: ["a.x"] });
    expect(autoAnswerableOptions("Checklist2")).toEqual(["Checklist2ChildAX"]);
    expect(autoAnswerableOptions("Checklist2")).not.toContain(
      "Checklist2ParentA",
    );
    clickContinue("Checklist2", {
      answers: autoAnswerableOptions("Checklist2"),
      auto: true,
    });

    expect(upcomingCardIds()?.[0]).toEqual("Question");
    expect(computePassport()?.data).toEqual({ values: ["a.x"] });
    expect(autoAnswerableOptions("Question")).toEqual(["QuestionChildAX"]);
    expect(autoAnswerableOptions("Question")).toHaveLength(1);
  });

  test("Selecting `a` and `b` auto-answers both", () => {
    // Manually answer the first Checklist
    expect(upcomingCardIds()).toEqual(["Checklist1", "Checklist2", "Question"]);
    clickContinue("Checklist1", {
      answers: ["Checklist1ParentA", "Checklist1ParentB"],
      auto: false,
    });

    // Both values are queued up for auto-answering the subsequent Checklist because they are the same granularity
    expect(upcomingCardIds()?.[0]).toEqual("Checklist2");
    expect(computePassport()?.data).toEqual({ values: ["a", "b"] });
    expect(autoAnswerableOptions("Checklist2")).toEqual([
      "Checklist2ParentA",
      "Checklist2ParentB",
    ]);
    clickContinue("Checklist2", {
      answers: autoAnswerableOptions("Checklist2"),
      auto: true,
    });

    // Only the left-most value is queued up for auto-answering the Question
    expect(upcomingCardIds()?.[0]).toEqual("Question");
    expect(computePassport()?.data).toEqual({ values: ["a", "b"] });
    expect(autoAnswerableOptions("Question")).toEqual(["QuestionParentA"]);
    expect(autoAnswerableOptions("Question")).toHaveLength(1);
  });

  test("Selecting `a`, `a.x` and `b` auto-answers `a.x` and `b` if a Checklist and only `a.x` if a Question", () => {
    // Manually answer the first Checklist
    expect(upcomingCardIds()).toEqual(["Checklist1", "Checklist2", "Question"]);
    clickContinue("Checklist1", {
      answers: ["Checklist1ParentA", "Checklist1ChildAX", "Checklist1ParentB"],
      auto: false,
    });

    // Only the most granular value _per_ parent category is retained in the passport and queued up for auto-answering the subsequent Checklist
    expect(upcomingCardIds()?.[0]).toEqual("Checklist2");
    expect(computePassport()?.data).toEqual({ values: ["a.x", "b"] });
    expect(autoAnswerableOptions("Checklist2")).toEqual([
      "Checklist2ChildAX",
      "Checklist2ParentB",
    ]);
    expect(autoAnswerableOptions("Checklist2")).not.toContain(
      "Checklist2ParentA",
    );
    clickContinue("Checklist2", {
      answers: autoAnswerableOptions("Checklist2"),
      auto: true,
    });

    // Only the most granular, left-most value is queued up for auto-answering the Question
    expect(upcomingCardIds()?.[0]).toEqual("Question");
    expect(computePassport()?.data).toEqual({ values: ["a.x", "b"] });
    expect(autoAnswerableOptions("Question")).toEqual(["QuestionChildAX"]);
    expect(autoAnswerableOptions("Question")).toHaveLength(1);
  });
});

// editor.planx.dev/testing/behaviour-check
const flow: Store.Flow = {
  _root: {
    edges: ["Checklist1", "Checklist2", "Question"],
  },
  QuestionParentB: {
    data: {
      val: "b",
      text: "b parent",
    },
    type: 200,
  },
  Checklist1ParentA: {
    data: {
      val: "a",
      text: "a parent",
    },
    type: 200,
  },
  Checklist2ChildAX: {
    data: {
      val: "a.x",
      text: "a child",
    },
    type: 200,
  },
  Checklist1: {
    data: {
      fn: "values",
      tags: [],
      text: "Pick many",
      allRequired: false,
      neverAutoAnswer: false,
    },
    type: 105,
    edges: ["Checklist1ParentA", "Checklist1ChildAX", "Checklist1ParentB"],
  },
  Checklist2: {
    data: {
      fn: "values",
      tags: [],
      text: "Pick many",
      allRequired: false,
      neverAutoAnswer: false,
    },
    type: 105,
    edges: [
      "Checklist2ParentA",
      "Checklist2ChildAX",
      "Checklist2ParentB",
      "Checklist2ParentC",
      "Checklist2Blank",
    ],
  },
  QuestionChildAX: {
    data: {
      val: "a.x",
      text: "a child",
    },
    type: 200,
  },
  QuestionParentA: {
    data: {
      val: "a",
      text: "a parent",
    },
    type: 200,
  },
  Checklist2ParentC: {
    data: {
      val: "c",
      text: "c parent",
    },
    type: 200,
  },
  QuestionBlank: {
    data: {
      text: "blank",
    },
    type: 200,
  },
  Checklist2Blank: {
    data: {
      text: "blank",
    },
    type: 200,
  },
  Checklist2ParentA: {
    data: {
      val: "a",
      text: "a parent",
    },
    type: 200,
  },
  Question: {
    data: {
      fn: "values",
      tags: [],
      text: "Pick one",
      neverAutoAnswer: false,
    },
    type: 100,
    edges: [
      "QuestionParentA",
      "QuestionChildAX",
      "QuestionParentB",
      "QuestionBlank",
    ],
  },
  Checklist1ParentB: {
    data: {
      val: "b",
      text: "b parent",
    },
    type: 200,
  },
  Checklist2ParentB: {
    data: {
      val: "b",
      text: "b parent",
    },
    type: 200,
  },
  Checklist1ChildAX: {
    data: {
      val: "a.x",
      text: "a child",
    },
    type: 200,
  },
};
