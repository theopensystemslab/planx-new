import { TYPES } from "@planx/components/types";
import { hasFeatureFlag } from "lib/featureFlags";
import { findLast, pick } from "lodash";
import { Store } from "pages/FlowEditor/lib/store";
import type { StateCreator } from "zustand";

import { PreviewStore } from "./preview";
import { SharedStore } from "./shared";

export interface SectionNode extends Store.node {
  data: {
    title: string;
  };
}

export enum SectionStatus {
  NeedsUpdated = "NEW INFORMATION NEEDED",
  ReadyToContinue = "READY TO CONTINUE",
  Started = "STARTED",
  ReadyToStart = "READY TO START",
  NotStarted = "CANNOT START YET",
  Completed = "COMPLETED",
}

export interface NavigationStore {
  currentSectionIndex: number;
  sectionCount: number;
  currentSectionTitle?: string;
  hasSections: boolean;
  sectionNodes: Record<string, SectionNode>;
  initNavigationStore: () => void;
  updateSectionData: () => void;
  filterFlowByType: (type: TYPES) => Store.flow;
  sectionStatuses: (args?: {
    sortedBreadcrumbs: Store.breadcrumbs;
    isReconciliation: boolean;
    alteredSectionIds?: string[];
  }) => Record<string, SectionStatus>;
  getSortedBreadcrumbsBySection: () => Store.breadcrumbs[];
  getSectionForNode: (nodeId: string) => SectionNode;
}

export const navigationStore: StateCreator<
  NavigationStore & SharedStore & PreviewStore,
  [],
  [],
  NavigationStore
> = (set, get) => ({
  currentSectionIndex: 1,

  sectionCount: 0,

  currentSectionTitle: undefined,

  hasSections: false,

  sectionNodes: {},

  /**
   * Set up initial values to populate store
   * Called by setFlow() as we require a flow from the DB before proceeding
   */
  initNavigationStore: () => {
    const sectionNodes = get().filterFlowByType(TYPES.Section) as Record<
      string,
      SectionNode
    >;
    const sectionCount = Object.keys(sectionNodes).length;
    const hasSections = Boolean(
      sectionCount && hasFeatureFlag("NAVIGATION_UI")
    );
    const currentSectionTitle = Object.values(sectionNodes)[0]?.data.title;

    set({
      sectionNodes,
      sectionCount,
      hasSections,
      currentSectionTitle,
    });
  },

  /**
   * Update title and index on record()
   * Triggered when going backwards, forwards, or changing answer
   */
  updateSectionData: () => {
    const { breadcrumbs, sectionNodes, hasSections } = get();
    // Sections not being used, do not proceed
    if (!hasSections) return;

    const breadcrumbIds = Object.keys(breadcrumbs);
    const sectionIds = Object.keys(sectionNodes);

    const mostRecentSectionId = findLast(
      breadcrumbIds,
      (breadcrumbId: string) => sectionIds.includes(breadcrumbId)
    );

    // No sections in breadcrumbs, first section values already set in store
    if (!mostRecentSectionId) return;

    // Update section
    const currentSectionTitle = sectionNodes[mostRecentSectionId].data.title;
    const currentSectionIndex = sectionIds.indexOf(mostRecentSectionId) + 1;
    set({ currentSectionTitle, currentSectionIndex });
  },

  /**
   * Get a subset of the full flow, by type
   * Returned in correct order, based on _root node's edges
   */
  filterFlowByType: (type: TYPES): Store.flow => {
    const flow = get().flow;
    const rootEdges = flow._root.edges || [];
    const filteredFlow = Object.fromEntries(
      Object.entries(flow)
        .filter(([_key, value]) => value.type === type)
        .sort(([idA], [idB]) => rootEdges.indexOf(idA) - rootEdges.indexOf(idB))
    );
    return filteredFlow;
  },

  // compute section statuses using breadcrumbs, cachedBreadcrumbs and currentCard
  sectionStatuses: (args?: {
    sortedBreadcrumbs: Store.breadcrumbs;
    isReconciliation: boolean;
    alteredSectionIds?: string[];
  }): Record<string, SectionStatus> => {
    const {
      sectionNodes,
      currentCard,
      cachedBreadcrumbs,
      breadcrumbs: storedBreadcrumbs,
    } = get();
    const breadcrumbs = args?.sortedBreadcrumbs || storedBreadcrumbs;
    const alteredSectionIds = args?.alteredSectionIds || null;
    const isReconciliation = args?.isReconciliation;

    const seenPastNodeIds = Object.keys({ ...breadcrumbs });
    const seenUpcomingNodeIds = Object.keys({ ...cachedBreadcrumbs });
    const allSeenNodeIds = [...seenPastNodeIds, ...seenUpcomingNodeIds];

    const sectionNodeIds = Object.keys(sectionNodes);
    const currentCardId = currentCard()?.id;

    const currentCardIsSection =
      currentCardId && sectionNodeIds.includes(currentCardId);

    let seenUpcomingSection = false;
    const sectionStatuses: Record<string, SectionStatus> = {};
    for (const [index, sectionId] of Object.entries(sectionNodeIds)) {
      // check for an altered sections
      if (alteredSectionIds && alteredSectionIds!.includes(sectionId)) {
        sectionStatuses[sectionId] = SectionStatus.NeedsUpdated;
        seenUpcomingSection = true;
        continue;
      }

      const nextSectionId = sectionNodeIds.at(Number(index) + 1);
      const seenNextSection =
        nextSectionId && allSeenNodeIds.includes(nextSectionId);
      const isLastSeenSection =
        allSeenNodeIds.includes(sectionId) && !seenNextSection;

      // check for an upcoming section
      if (!seenUpcomingSection) {
        if (
          seenUpcomingNodeIds.includes(sectionId) ||
          (isLastSeenSection && !currentCardIsSection)
        ) {
          sectionStatuses[sectionId] = SectionStatus.ReadyToContinue;
          seenUpcomingSection = true;
        } else if (!allSeenNodeIds.includes(sectionId)) {
          sectionStatuses[sectionId] = SectionStatus.ReadyToStart;
          seenUpcomingSection = true;
        } else {
          sectionStatuses[sectionId] = SectionStatus.Completed;
        }
        continue;
      }

      // check for remaining sections
      if (allSeenNodeIds.includes(sectionId)) {
        sectionStatuses[sectionId] = SectionStatus.Started;
      } else {
        sectionStatuses[sectionId] = SectionStatus.NotStarted;
      }
    }

    return sectionStatuses;
  },

  // if this flow has sections, split the breadcrumbs up by sections,
  //    so we can render section node titles as h2s and the following nodes as individual SummaryLists
  getSortedBreadcrumbsBySection: () => {
    const { breadcrumbs, sectionNodes, hasSections } = get();
    const sortedBreadcrumbsBySection: Store.breadcrumbs[] = [];
    if (hasSections) {
      const sortedNodeIdsBySection: string[][] = [];
      Object.keys(sectionNodes).forEach((sectionId, i) => {
        const nextSectionId: string = Object.keys(sectionNodes)[i + 1];
        const isLastSection: boolean =
          Object.keys(sectionNodes).pop() === sectionId;

        // get the nodeIds in order for each section, where the first nodeId in an array should always be a section type
        sortedNodeIdsBySection.push(
          Object.keys(breadcrumbs).slice(
            Object.keys(breadcrumbs).indexOf(sectionId),
            isLastSection
              ? undefined
              : Object.keys(breadcrumbs).indexOf(nextSectionId)
          )
        );
      });

      // chunk the breadcrumbs based on the nodeIds in a given section
      sortedNodeIdsBySection.forEach((nodeIds) => {
        sortedBreadcrumbsBySection.push(pick(breadcrumbs, nodeIds));
      });
    }

    return sortedBreadcrumbsBySection;
  },

  getSectionForNode: (nodeId: string): SectionNode => {
    const { getSortedBreadcrumbsBySection, sectionNodes } = get();
    const sections = getSortedBreadcrumbsBySection();
    const sectionIndex = sections.findIndex((section) =>
      Object.keys(section).includes(nodeId)
    );
    const sectionId = Object.keys(sectionNodes)[sectionIndex];
    const section = sectionNodes[sectionId];
    return section;
  },
});
