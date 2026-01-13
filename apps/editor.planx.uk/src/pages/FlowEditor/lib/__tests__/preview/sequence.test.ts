import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { Store, useStore } from "../../store";

const { getState, setState } = useStore;
const { resetPreview, record, changeAnswer } = getState();

const flow: Store.Flow = {
  _root: {
    edges: ["Question", "Content", "Confirmation"],
  },
  Question: {
    type: TYPES.Question,
    data: {
      text: "first question",
    },
    edges: ["OneBranch", "AnotherBranch"],
  },
  OneBranch: {
    type: TYPES.Answer,
    data: {
      text: "One Branch",
    },
    edges: ["Content"],
  },
  AnotherBranch: {
    type: TYPES.Answer,
    data: {
      text: "Another Branch",
    },
  },
  Confirmation: {
    type: TYPES.Confirmation,
    data: {
      heading: "Form sent",
    },
  },
  Content: {
    type: TYPES.Content,
    data: {
      content: "<p>After one Branch</p>\n",
    },
  },
};

beforeEach(() => {
  resetPreview();
  setState({
    flow,
  });
});

test("a sequence is added to all breadcrumbs on creation", () => {
  expect(Object.keys(getState().breadcrumbs)).toHaveLength(0);

  record("Question", {
    auto: false,
    answers: ["OneBranch"],
  });

  expect(Object.keys(getState().breadcrumbs)).toHaveLength(1);
  expect(getState().breadcrumbs["Question"]).toHaveProperty("seq", 1);
});

test("sequences are correctly ordered", () => {
  record("Question", {
    auto: false,
    answers: ["OneBranch"],
  });

  record("Content", { auto: false });

  const first = getState().breadcrumbs["Question"].seq!;
  const second = getState().breadcrumbs["Content"].seq!;

  expect(second).toBeGreaterThan(first);
});

describe("going back", () => {
  it("removes a breadcrumb", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });

    record("Content", { auto: false });

    expect(Object.keys(getState().breadcrumbs)).toHaveLength(2);

    // Go back
    record("Content");
    expect(Object.keys(getState().breadcrumbs)).toHaveLength(1);
  });

  it("retains a breadcrumb in cached breadcrumbs", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });

    record("Content", { auto: false });

    // Nothing currently cached
    let cached = getState().cachedBreadcrumbs;
    expect(Object.keys(cached!)).toHaveLength(0);

    // Go back
    record("Content");

    // Cache now holds removed breadcrumb
    cached = getState().cachedBreadcrumbs;
    expect(cached).toBeDefined();
    expect(Object.keys(cached!)).toHaveLength(1);
    expect(cached!["Content"]).toBeDefined();
  });

  it("creates a new breadcrumb, replacing the sequence, when going forwards again", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });

    record("Content", { auto: false });
    const originalSequence = getState().breadcrumbs["Content"].seq!;

    // Go back
    record("Content");
    const cachedSequence = getState().cachedBreadcrumbs!["Content"].seq!;

    // Cache holds original value
    expect(originalSequence).toEqual(cachedSequence);

    // Re-answer question
    record("Content", { auto: false });
    const newSequence = getState().breadcrumbs["Content"].seq!;

    // New breadcrumb created, with new sequence
    expect(newSequence).toEqual(originalSequence);
  });
});

describe("changing an answer", () => {
  it("removes multiple breadcrumbs", () => {
    // Breadcrumbs start empty
    expect(Object.keys(getState().breadcrumbs)).toHaveLength(0);

    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });

    record("Content", { auto: false });

    // Breadcrumbs match the number of nodes visited
    expect(Object.keys(getState().breadcrumbs)).toHaveLength(2);

    // Go back to first node
    changeAnswer("Question");

    // Breadcrumbs cleared
    expect(Object.keys(getState().breadcrumbs)).toHaveLength(0);
  });

  it("retains multiple breadcrumbs in cached breadcrumbs", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });

    record("Content", { auto: false });

    // Go back to first node
    changeAnswer("Question");

    // Breadcrumbs cleared
    expect(Object.keys(getState().cachedBreadcrumbs!)).toHaveLength(2);
  });

  it("creates new breadcrumbs, with new sequences, when going forwards again", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });
    const originalQuestionSequence = getState().breadcrumbs["Question"].seq!;

    record("Content", { auto: true });
    const originalContentSequence = getState().breadcrumbs["Content"].seq!;

    // Go back to first question
    record("Question");

    // Cache retains original values
    const cache = getState().cachedBreadcrumbs!;
    expect(Object.keys(cache)).toHaveLength(2);
    const cachedQuestionSequence =
      getState().cachedBreadcrumbs!["Question"].seq!;
    const cachedContentSequence = getState().cachedBreadcrumbs!["Content"].seq!;

    expect(cachedQuestionSequence).toEqual(originalQuestionSequence);
    expect(cachedContentSequence).toEqual(originalContentSequence);

    // Re-answer question, with different branch
    record("Question", {
      auto: false,
      answers: ["AnotherBranch"],
    });

    // New breadcrumb created, with same sequence
    const newQuestionSequence = getState().breadcrumbs["Question"].seq!;

    expect(newQuestionSequence).toEqual(originalQuestionSequence);
  });
});
