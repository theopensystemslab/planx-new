import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { isAfter, isEqual } from "date-fns";

import { Store, useStore } from "../../store";

const { getState, setState } = useStore;
const { resetPreview, record, changeAnswer } =
  getState();

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
    edges: ["Content"]
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
  vi.useFakeTimers()

  resetPreview();
  setState({
    flow,
  });
});

afterEach(() => {
  vi.useRealTimers()
})

test("a timestamp is added to all breadcrumbs on creation", () => {
  expect(Object.keys(getState().breadcrumbs)).toHaveLength(0);

  record("Question", {
    auto: false,
    answers: ["OneBranch"],
  });

  expect(Object.keys(getState().breadcrumbs)).toHaveLength(1);
  expect(getState().breadcrumbs["Question"]).toHaveProperty("createdAt");
});

test("timestamps are correctly ordered", () => {
  record("Question", {
    auto: false,
    answers: ["OneBranch"],
  });

  vi.advanceTimersByTime(5_000)
  record("Content", { auto: false });

  const first = new Date(getState().breadcrumbs["Question"].createdAt!);
  const second = new Date(getState().breadcrumbs["Content"].createdAt!);

  expect(isAfter(second, first)).toBe(true);
});

describe("going back", () => {
  it("removes a breadcrumb", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });

    vi.advanceTimersByTime(5_000)
    record("Content", { auto: false });

    expect(Object.keys(getState().breadcrumbs)).toHaveLength(2);

    // Go back
    record("Content");
    expect(Object.keys(getState().breadcrumbs)).toHaveLength(1);
  })
  
  it("retains a breadcrumb in cached breadcrumbs", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });

    vi.advanceTimersByTime(5_000)
    record("Content", { auto: false });

    // Nothing currently cached
    let cached = getState().cachedBreadcrumbs;
    expect(Object.keys(cached!)).toHaveLength(0);
    
    // Go back
    vi.advanceTimersByTime(5_000)
    record("Content");

    // Cache now holds removed breadcrumb
    cached = getState().cachedBreadcrumbs;
    expect(cached).toBeDefined();
    expect(Object.keys(cached!)).toHaveLength(1);
    expect(cached!["Content"]).toBeDefined();
  });

  it("creates a new breadcrumb, with a new timestamp, when going forwards again", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });
    
    vi.advanceTimersByTime(5_000)
    record("Content", { auto: false });
    const originalTimestamp = new Date(getState().breadcrumbs["Content"].createdAt!);
    
    // Go back
    vi.advanceTimersByTime(5_000);
    record("Content");
    const cachedTimestamp = new Date(getState().cachedBreadcrumbs!["Content"].createdAt!);

    // Cache holds original value
    expect(isEqual(originalTimestamp, cachedTimestamp)).toBe(true);
    
    // Re-answer question
    vi.advanceTimersByTime(5_000);
    record("Content", { auto: false });
    const newTimestamp = new Date(getState().breadcrumbs["Content"].createdAt!);

    // New breadcrumb created, with new timestamp
    expect(isAfter(newTimestamp, originalTimestamp)).toBe(true);
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

    vi.advanceTimersByTime(5_000)
    record("Content", { auto: false });

    // Breadcrumbs match the number of nodes visited
    expect(Object.keys(getState().breadcrumbs)).toHaveLength(2);
  
    // Go back to first node
    vi.advanceTimersByTime(5_000)
    changeAnswer("Question");

    // Breadcrumbs cleared
    expect(Object.keys(getState().breadcrumbs)).toHaveLength(0);
  });

  it("retains multiple breadcrumb in cached breadcrumbs", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });

    vi.advanceTimersByTime(5_000)
    record("Content", { auto: false });

    // Go back to first node
    vi.advanceTimersByTime(5_000)
    changeAnswer("Question");

    // Breadcrumbs cleared
    expect(Object.keys(getState().cachedBreadcrumbs!)).toHaveLength(2);
  });

  it("creates new breadcrumbs, with new timestamps, when going forwards again", () => {
    record("Question", {
      auto: false,
      answers: ["OneBranch"],
    });
    const originalQuestionTimestamp = new Date(getState().breadcrumbs["Question"].createdAt!);

    vi.advanceTimersByTime(5_000)
    record("Content", { auto: true });
    const originalContentTimestamp = new Date(getState().breadcrumbs["Content"].createdAt!);

    // Go back to first question
    vi.advanceTimersByTime(5_000);
    record("Question");
    
    // Cache retains original values
    const cache = getState().cachedBreadcrumbs!;
    expect(Object.keys(cache)).toHaveLength(2);
    const cachedQuestionTimestamp = new Date(getState().cachedBreadcrumbs!["Question"].createdAt!);
    const cachedContentTimestamp = new Date(getState().cachedBreadcrumbs!["Content"].createdAt!);

    expect(isEqual(cachedQuestionTimestamp, originalQuestionTimestamp)).toBe(true);
    expect(isEqual(cachedContentTimestamp, originalContentTimestamp)).toBe(true);

    // Re-answer question, with different branch
    vi.advanceTimersByTime(5_000);
    record("Question", {
      auto: false,
      answers: ["AnotherBranch"],
    });

    // New breadcrumb created, with new timestamp
    const newQuestionTimestamp = new Date(getState().breadcrumbs["Question"].createdAt!);

    expect(isAfter(newQuestionTimestamp, originalQuestionTimestamp)).toBe(true);
  });
});