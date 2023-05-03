import type { Store } from "pages/FlowEditor/lib/store";
import { SectionNode, SectionStatus } from "types";

import { MoreInformation, parseMoreInformation } from "../shared";

export interface Section extends MoreInformation {
  title: string;
}

export const parseSection = (
  data: Record<string, any> | undefined
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
  const seenPastNodeIds = Object.keys({ ...breadcrumbs });
  const seenUpcomingNodeIds = cachedBreadcrumbs
    ? Object.keys({ ...cachedBreadcrumbs })
    : [];
  const allSeenNodeIds = [...seenPastNodeIds, ...seenUpcomingNodeIds];
  const currentCardId = currentCard?.id;
  const sectionNodeIds = Object.keys(sectionNodes);

  let hasPastCurrentSection = false;
  let sectionStatuses: Record<string, SectionStatus> = {};
  for (const [index, sectionId] of Object.entries(sectionNodeIds)) {
    // check for an altered sections
    if (alteredSectionIds && alteredSectionIds!.includes(sectionId)) {
      sectionStatuses[sectionId] = SectionStatus.NeedsUpdated;
      hasPastCurrentSection = true;
      continue;
    }
    // check for seen/current sections
    if (!hasPastCurrentSection) {
      const nextSectionId = sectionNodeIds.at(Number(index) + 1);
      const seenNextSection =
        nextSectionId && allSeenNodeIds.includes(nextSectionId);
      if (
        !allSeenNodeIds.includes(sectionId) ||
        (isReconciliation && !seenNextSection && currentCardId === sectionId)
      ) {
        sectionStatuses[sectionId] = SectionStatus.ReadyToStart;
        hasPastCurrentSection = true;
      } else if (
        seenUpcomingNodeIds.includes(sectionId) ||
        (isReconciliation &&
          !seenNextSection &&
          currentCardId !== sectionId &&
          !sectionNodeIds.includes(currentCardId!))
      ) {
        sectionStatuses[sectionId] = SectionStatus.ReadyToContinue;
        hasPastCurrentSection = true;
      } else {
        sectionStatuses[sectionId] = SectionStatus.Completed;
      }
      continue;
    }
    // check for unseen sections
    if (allSeenNodeIds.includes(sectionId)) {
      sectionStatuses[sectionId] = SectionStatus.Started;
    } else {
      sectionStatuses[sectionId] = SectionStatus.NotStarted;
    }
  }

  return sectionStatuses;
}
