import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { Section } from "@planx/components/Section/model";
import { sortIdsDepthFirst } from "@planx/graph";
import { findLast, pick } from "lodash";
import { Store } from "pages/FlowEditor/lib/store";
import type { StateCreator } from "zustand";

import { PreviewStore } from "./preview";
import { SharedStore } from "./shared";

export interface SectionNode extends Store.Node {
  data: Section;
}

export interface NavigationStore {
  currentSectionIndex: number;
  sectionCount: number;
  currentSectionTitle?: string;
  hasSections: boolean;
  sectionNodes: Record<string, SectionNode>;
  initNavigationStore: () => void;
  updateSectionData: () => void;
  filterFlowByType: (type: TYPES) => Store.Flow;
  getSortedBreadcrumbsBySection: () => Store.Breadcrumbs[];
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
    const hasSections = Boolean(sectionCount);
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
      (breadcrumbId: string) => sectionIds.includes(breadcrumbId),
    );

    // No sections in breadcrumbs, first section values already set in store
    if (!mostRecentSectionId) return;

    // Update section
    const currentSectionTitle = sectionNodes[mostRecentSectionId].data.title;
    const currentSectionIndex = sectionIds.indexOf(mostRecentSectionId) + 1;
    set({ currentSectionTitle, currentSectionIndex });
    console.debug("section state updated"); // used as a transition trigger in e2e tests
  },

  /**
   * Get a subset of the full flow by type
   * Returned in depth-first order
   */
  filterFlowByType: (type: TYPES): Store.Flow => {
    // Filter the full flow
    const flow = get().flow;
    const filteredFlow = Object.fromEntries(
      Object.entries(flow).filter(([_key, value]) => value.type === type),
    );

    // Sort IDs-only depth-first
    const filteredNodeIds = Object.entries(filteredFlow).map(
      (entry) => entry[0],
    );
    const sortedFilteredNodeIds = sortIdsDepthFirst(flow)(
      new Set(filteredNodeIds),
    );

    // Reconstruct the full node objects preserving depth-first sorted order
    const sortedFilteredFlow: { [k: string]: Store.Node } = {};
    sortedFilteredNodeIds.forEach(
      (id) => (sortedFilteredFlow[id] = filteredFlow[id]),
    );

    return sortedFilteredFlow;
  },

  // if this flow has sections, split the breadcrumbs up by sections,
  //    so we can render section node titles as h2s and the following nodes as individual SummaryLists
  getSortedBreadcrumbsBySection: () => {
    const { breadcrumbs, sectionNodes, hasSections } = get();
    const sortedBreadcrumbsBySection: Store.Breadcrumbs[] = [];
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
              : Object.keys(breadcrumbs).indexOf(nextSectionId),
          ),
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
      Object.keys(section).includes(nodeId),
    );
    const sectionId = Object.keys(sectionNodes)[sectionIndex];
    const section = sectionNodes[sectionId];
    return section;
  },
});
