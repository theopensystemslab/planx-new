import { TYPES } from "@planx/components/types";
import { hasFeatureFlag } from "lib/featureFlags";
import { findLast } from "lodash";
import { Store } from "pages/FlowEditor/lib/store";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";

interface SectionNode extends Store.node {
  data: {
    title: string;
  };
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
}

export const navigationStore: StateCreator<
  NavigationStore & SharedStore,
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
   * Triggered when going backewards, forwards, or changing answer
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

    // This should not happen - if we have sections, we should have a most recent section
    // Failing noisily for now will help identify issues whilst this is being developed & tested
    // TODO: Fail more gracefully once feature is complete
    if (!mostRecentSectionId) throw Error("Error finding mostRecentSectionId");

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
});
