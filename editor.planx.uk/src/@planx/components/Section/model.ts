import { richText } from "lib/yupExtensions";
import type { Store } from "pages/FlowEditor/lib/store";
import { SectionNode, SectionStatus } from "types";
import { mixed, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface Section extends BaseNodeData {
  title: string;
  description?: string;
  size: SectionSize;
}

export const parseSection = (
  data: Record<string, any> | undefined,
): Section => ({
  title: data?.title || "",
  description: data?.description,
  size: data?.size || "medium",
  ...parseBaseNodeData(data),
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
  currentCard: Store.Node | null;
  breadcrumbs: Store.Breadcrumbs;
  cachedBreadcrumbs?: Store.CachedBreadcrumbs;
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

export const SECTION_SIZE = ["short", "medium", "long"] as const;
export type SectionSize = (typeof SECTION_SIZE)[number];

export const SECTION_WEIGHTS: Record<SectionSize, number> = {
  short: 4,
  medium: 8,
  long: 16,
} as const;

export const validationSchema: SchemaOf<Section> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      size: mixed()
        .oneOf([...SECTION_SIZE])
        .required(),
    }),
  );
