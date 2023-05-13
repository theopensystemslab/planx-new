import { TYPES } from "@planx/components/types";
import { SectionNode, SectionStatus } from "types";

import { computeSectionStatuses } from "./model";

const flowSections: { [key: string]: SectionNode } = {
  firstSection: {
    data: {
      title: "First section",
    },
    type: TYPES.Section,
  },
  secondSection: {
    data: {
      title: "Second section",
    },
    type: TYPES.Section,
  },
  thirdSection: {
    data: {
      title: "Third section",
    },
    type: TYPES.Section,
  },
};

describe("computeSectionStatuses", () => {
  test("the initial statuses of a flow with sections", () => {
    // Get initial statuses
    const statuses = computeSectionStatuses({
      sectionNodes: flowSections,
      currentCard: null,
      breadcrumbs: {},
    });

    // There's a status entry per section node in the test flow
    expect(Object.keys(statuses)).toHaveLength(3);

    // Initial statuses are calculated correctly
    expect(statuses).toEqual({
      firstSection: SectionStatus.ReadyToStart,
      secondSection: SectionStatus.NotStarted,
      thirdSection: SectionStatus.NotStarted,
    });
  });

  test("the status of sections in a flow as you navigate forwards", () => {
    // Get statuses
    const statuses = computeSectionStatuses({
      sectionNodes: flowSections,
      currentCard: null,
      breadcrumbs: {
        firstSection: { auto: false },
        firstQuestion: { answers: ["firstAnswer"] },
      },
    });

    // Confirm statuses have been updated correctly
    expect(statuses).toEqual({
      firstSection: SectionStatus.Completed,
      secondSection: SectionStatus.ReadyToStart,
      thirdSection: SectionStatus.NotStarted,
    });

    const newStatuses = computeSectionStatuses({
      sectionNodes: flowSections,
      currentCard: null,
      breadcrumbs: {
        firstSection: { auto: false },
        firstQuestion: { answers: ["firstAnswer"] },
        secondSection: { auto: false },
        secondQuestion: { answers: ["secondAnswer"] },
      },
    });

    // Confirm statuses have been updated correctly
    expect(newStatuses).toEqual({
      firstSection: SectionStatus.Completed,
      secondSection: SectionStatus.Completed,
      thirdSection: SectionStatus.ReadyToStart,
    });
  });

  test("a section was updated during reconciliation", () => {
    // breadcrumbs and alteredSectionIds are passed in at reconciliation
    const statuses = computeSectionStatuses({
      sectionNodes: flowSections,
      isReconciliation: true,
      currentCard: {
        id: "firstQuestion",
      },
      breadcrumbs: {
        firstSection: { auto: false },
        firstQuestion: { answers: ["firstAnswer"] },
      },
      alteredSectionIds: ["firstSection"],
    });

    expect(statuses).toEqual({
      firstSection: SectionStatus.NeedsUpdated, // no longer considered Completed
      secondSection: SectionStatus.NotStarted,
      thirdSection: SectionStatus.NotStarted,
    });
  });

  test("completed sections on reconciliation", () => {
    const statuses = computeSectionStatuses({
      sectionNodes: flowSections,
      isReconciliation: true,
      currentCard: {
        id: "thirdSection",
      },
      breadcrumbs: {
        firstSection: { auto: false },
        firstQuestion: { answers: ["firstAnswer"] },
        secondSection: { auto: false },
        secondQuestion: { answers: ["secondAnswer"] },
      },
    });

    expect(statuses).toEqual({
      firstSection: SectionStatus.Completed,
      secondSection: SectionStatus.Completed,
      thirdSection: SectionStatus.ReadyToStart,
    });
  });

  test("NEW INFORMATION NEEDED statuses on reconciliation", () => {
    const statuses = computeSectionStatuses({
      sectionNodes: flowSections,
      isReconciliation: true,
      currentCard: {
        id: "firstQuestion",
      },
      breadcrumbs: {
        firstSection: { auto: false },
        firstQuestion: { answers: ["firstAnswer"] },
        secondSection: { auto: false },
        secondQuestion: { answers: ["secondAnswer"] },
      },
      alteredSectionIds: ["firstSection"],
    });

    expect(statuses).toEqual({
      firstSection: SectionStatus.NeedsUpdated,
      secondSection: SectionStatus.Started,
      thirdSection: SectionStatus.NotStarted,
    });
  });
});
