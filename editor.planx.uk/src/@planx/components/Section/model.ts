import type { Store } from "pages/FlowEditor/lib/store";
import { SectionNode, SectionStatus } from "types";

import { MoreInformation, parseMoreInformation } from "../shared";

export interface Section extends MoreInformation {
  title: string;
}

export const parseSection = (
  data: Record<string, any> | undefined,
): Section => ({
  title: data?.title || "",
  ...parseMoreInformation(data),
});

export function computeSectionStatuses({
  sectionNodes,
  currentCard,
  breadcrumbs,
  cachedBreadcrumbs,
  isReconciliation,
  alteredSectionIds,
}: {
  sectionNodes: Record<string, SectionNode>;
  currentCard: Store.node | null;
  breadcrumbs: Store.breadcrumbs;
  cachedBreadcrumbs?: Store.cachedBreadcrumbs;
  isReconciliation?: boolean;
  alteredSectionIds?: string[];
}): Record<string, SectionStatus> {
  const visitedNodeIds = Object.keys({ ...breadcrumbs });
  const visitedUpcomingNodeIds = cachedBreadcrumbs
    ? Object.keys({ ...cachedBreadcrumbs })
    : [];
  const allVisitedNodeIds = [...visitedNodeIds, ...visitedUpcomingNodeIds];
  const currentCardId = currentCard?.id;
  const sectionNodeIds = Object.keys(sectionNodes);

  let reachedCurrentSection = false;
  const sectionStatuses: Record<string, SectionStatus> = {};
  for (const [index, sectionId] of Object.entries(sectionNodeIds)) {
    // check for an altered sections
    if (alteredSectionIds && alteredSectionIds!.includes(sectionId)) {
      sectionStatuses[sectionId] = SectionStatus.NeedsUpdated;
      reachedCurrentSection = true;
      continue;
    }
    // check up until the current section
    if (!reachedCurrentSection) {
      const nextSectionId = sectionNodeIds.at(Number(index) + 1);
      const visitedNextSection =
        nextSectionId && allVisitedNodeIds.includes(nextSectionId);
      if (
        !allVisitedNodeIds.includes(sectionId) ||
        (isReconciliation && !visitedNextSection && currentCardId === sectionId)
      ) {
        sectionStatuses[sectionId] = SectionStatus.ReadyToStart;
        reachedCurrentSection = true;
      } else if (
        visitedUpcomingNodeIds.includes(sectionId) ||
        (isReconciliation &&
          !visitedNextSection &&
          currentCardId !== sectionId &&
          !sectionNodeIds.includes(currentCardId!))
      ) {
        sectionStatuses[sectionId] = SectionStatus.ReadyToContinue;
        reachedCurrentSection = true;
      } else {
        sectionStatuses[sectionId] = SectionStatus.Completed;
      }
      continue;
    }
    // check sections past the current section
    if (allVisitedNodeIds.includes(sectionId)) {
      sectionStatuses[sectionId] = SectionStatus.Started;
    } else {
      sectionStatuses[sectionId] = SectionStatus.NotStarted;
    }
  }

  return sectionStatuses;
}
