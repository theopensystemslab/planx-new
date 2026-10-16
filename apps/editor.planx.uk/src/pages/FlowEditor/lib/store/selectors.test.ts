import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import type { Store } from ".";
import {
  selectCurrentSectionIndex,
  selectCurrentSectionTitle,
  selectHasSections,
  selectSectionCount,
  selectSectionNodes,
  selectSectionProgress,
} from "./selectors";

const flow: Store.Flow = {
  _root: { edges: ["firstSection", "question", "folder"] },
  firstSection: {
    type: TYPES.Section,
    data: { title: "First", length: "short" },
  },
  question: { type: TYPES.Question, data: { text: "Question" } },
  folder: { type: TYPES.InternalPortal, edges: ["secondSection"] },
  secondSection: {
    type: TYPES.Section,
    data: { title: "Second", length: "long" },
  },
};

type NavigationState = Parameters<typeof selectCurrentSectionIndex>[0];

const state = (overrides: Partial<NavigationState> = {}): NavigationState => ({
  flow,
  breadcrumbs: {},
  currentCard: null,
  ...overrides,
});

describe("selectSectionNodes()", () => {
  it("returns sections on the root and within folders, in order", () => {
    expect(Object.keys(selectSectionNodes(state()))).toEqual([
      "firstSection",
      "secondSection",
    ]);
    expect(selectSectionCount(state())).toBe(2);
    expect(selectHasSections(state())).toBe(true);
  });

  it("returns the cached result for the same flow", () => {
    expect(selectSectionNodes(state())).toBe(selectSectionNodes(state()));
  });

  it("recomputes for a new flow", () => {
    const first = selectSectionNodes(state());
    const second = selectSectionNodes(state({ flow: { ...flow } }));

    expect(second).not.toBe(first);
    expect(second).toEqual(first);
  });

  it("handles a flow without sections", () => {
    const empty = state({ flow: { _root: { edges: [] } } });

    expect(selectSectionNodes(empty)).toEqual({});
    expect(selectHasSections(empty)).toBe(false);
    expect(selectCurrentSectionTitle(empty)).toBeUndefined();
    expect(selectSectionProgress(empty)).toBeUndefined();
  });
});

describe("selectCurrentSectionIndex()", () => {
  it("defaults to the first section before any section is reached", () => {
    expect(selectCurrentSectionIndex(state())).toBe(1);
    expect(selectCurrentSectionTitle(state())).toBe("First");
  });

  it("uses the most recent section in breadcrumbs", () => {
    const breadcrumbs = {
      firstSection: { auto: false },
      question: { auto: false },
      secondSection: { auto: false },
    };

    expect(selectCurrentSectionIndex(state({ breadcrumbs }))).toBe(2);
    expect(selectCurrentSectionTitle(state({ breadcrumbs }))).toBe("Second");
  });

  it("counts a section card as entered once it's the current card", () => {
    const breadcrumbs = { firstSection: { auto: false } };
    const currentCard = { id: "secondSection", ...flow.secondSection };

    expect(selectCurrentSectionIndex(state({ breadcrumbs, currentCard }))).toBe(
      2,
    );
  });
});

describe("selectSectionProgress()", () => {
  it("weights progress by section length", () => {
    // short (4) + long (16) = 20
    expect(selectSectionProgress(state())).toEqual({
      completed: 0,
      current: 20,
    });

    const breadcrumbs = { firstSection: { auto: false } };
    const currentCard = { id: "secondSection", ...flow.secondSection };
    expect(selectSectionProgress(state({ breadcrumbs, currentCard }))).toEqual({
      completed: 20,
      current: 80,
    });
  });

  it("returns a stable object while the current section is unchanged", () => {
    const first = selectSectionProgress(state());

    // New breadcrumbs, but still in the first section
    const second = selectSectionProgress(
      state({ breadcrumbs: { firstSection: { auto: false } } }),
    );

    expect(second).toBe(first);
  });
});
