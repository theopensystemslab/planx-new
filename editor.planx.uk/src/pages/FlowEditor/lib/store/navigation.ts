import { TYPES } from "@planx/components/types";
import { hasFeatureFlag } from "lib/featureFlags";
import { findLast } from "lodash";
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
  NotStarted = "CANNOT START YET",
  ReadyToStart = "READY TO START",
  Started = "STARTED",
  Completed = "COMPLETED",
  NeedsUpdated = "NEEDS UPDATED", // future reconciliation scenario, not used yet
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
  sectionStatuses: () => Record<string, SectionStatus>;
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

    // Fallback to the first sectionId, which allows us to have a mostRecentSectionId on the first node ("Card") before it exists in breadcrumbs (eg "Continue" hasn't been clicked yet)
    const mostRecentSectionId =
      findLast(breadcrumbIds, (breadcrumbId: string) =>
        sectionIds.includes(breadcrumbId)
      ) || sectionIds[0];

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
   * Calculate the status of each section node based on the current position in a flow
   *   ** will need to become aware of all breadcrumbs within a section in the near future for "back" rather than only currentCard & upcomingCardIds
   */
  sectionStatuses: (): Record<string, SectionStatus> => {
    const { sectionNodes, currentCard, upcomingCardIds, cachedBreadcrumbs } =
      get();

    const sectionStatuses: Record<string, SectionStatus> = {};
    Object.keys(sectionNodes).forEach((sectionId) => {
      if (
        currentCard()?.id === sectionId &&
        cachedBreadcrumbs &&
        Object.keys(cachedBreadcrumbs).includes(sectionId)
      ) {
        sectionStatuses[sectionId] = SectionStatus.Started;
      } else if (currentCard()?.id === sectionId) {
        sectionStatuses[sectionId] = SectionStatus.ReadyToStart;
      } else if (upcomingCardIds()?.includes(sectionId)) {
        sectionStatuses[sectionId] = SectionStatus.NotStarted;
      } else {
        sectionStatuses[sectionId] = SectionStatus.Completed;
      }
    });

    return sectionStatuses;
  },
});
