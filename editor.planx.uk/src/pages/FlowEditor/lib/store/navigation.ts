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
  NotStarted = "CANNOT CONTINUE YET",
  InProgress = "READY TO CONTINUE",
  Completed = "COMPLETED",
  NeedsUpdated = "NEW INFORMATION NEEDED",
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
  sectionStatuses: (
    breadcrumbs?: Store.breadcrumbs,
    updatedSectionNodeIds?: string[]
  ) => Record<string, SectionStatus>;
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

  /**
   * Calculate the status of each section node based on the current position in a flow (eg state.cachedBreadcrumbs) or provided breadcrumbs (eg on reconciliation)
   *   Pass updatedNodeIds on reconiliation to ensure we set an accurrate status for every previously seen section because updated sections are removed from breadcrumbs during reconciliation
   */
  sectionStatuses: (
    breadcrumbs?: Store.breadcrumbs,
    updatedNodeIds?: string[]
  ): Record<string, SectionStatus> => {
    const { sectionNodes, currentCard, upcomingCardIds, cachedBreadcrumbs } =
      get();

    // Default to cachedBreadcrumbs unless a breadcrumbs-like object is explicitly provided (eg on reconciliation, before app state has been updated)
    if (!breadcrumbs) breadcrumbs = cachedBreadcrumbs;

    const sectionStatuses: Record<string, SectionStatus> = {};
    Object.keys(sectionNodes).forEach((sectionId) => {
      if (updatedNodeIds?.includes(sectionId)) {
        // We only expect to receive updatedSectionNodeIds argument on reconciliation, therefore
        //   this status should never apply to regular forwards/back/change navigation
        sectionStatuses[sectionId] = SectionStatus.NeedsUpdated;
      } else if (
        currentCard()?.id === sectionId ||
        (breadcrumbs && Object.keys(breadcrumbs).includes(sectionId))
      ) {
        sectionStatuses[sectionId] = SectionStatus.InProgress;
      } else if (upcomingCardIds()?.includes(sectionId)) {
        sectionStatuses[sectionId] = SectionStatus.NotStarted;
      } else {
        sectionStatuses[sectionId] = SectionStatus.Completed;
      }
    });

    // If there is more than one in-progress section, correct all but most recent one to display as complete
    //   ** this scenario should only be possible on reconcilation when cachedBreadcrumbs are unavailable
    if (
      Object.values(sectionStatuses).filter(
        (status) => status === SectionStatus.InProgress
      ).length > 1
    ) {
      const inProgressSectionIds = Object.keys(sectionStatuses).filter(
        (sectionId) => sectionStatuses[sectionId] === SectionStatus.InProgress
      );
      const completedSectionIds = inProgressSectionIds.slice(0, -1);
      completedSectionIds.forEach((sectionId) => {
        sectionStatuses[sectionId] = SectionStatus.Completed;
      });
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
