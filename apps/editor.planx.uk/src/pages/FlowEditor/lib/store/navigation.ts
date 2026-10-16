import type {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { sortIdsDepthFirst } from "@planx/graph";
import { pick } from "lodash";
import type { Store } from "pages/FlowEditor/lib/store";
import type { StateCreator } from "zustand";

import type { PreviewStore } from "./preview";
import { selectHasSections, selectSectionNodes } from "./selectors";
import type { SharedStore } from "./shared";
import type { SectionNode } from "./utils/sections";

export interface NavigationStore {
  filterFlowByType: (type: TYPES) => Store.Flow;
  filterFlowByTag: (tag: NodeTag) => Store.Flow;
  getSortedBreadcrumbsBySection: () => Store.Breadcrumbs[];
  getSectionForNode: (nodeId: string) => SectionNode;
  isNavMenuVisible: boolean;
  setIsNavMenuVisible: (visible: boolean) => void;
}

export const navigationStore: StateCreator<
  NavigationStore & SharedStore & PreviewStore,
  [],
  [],
  NavigationStore
> = (set, get) => ({
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

  /**
   * Get a subset of the full flow by tag
   * Returned in depth-first order
   */
  filterFlowByTag: (tag) => {
    // Filter the full flow
    const flow = get().flow;
    const filteredFlow = Object.fromEntries(
      Object.entries(flow).filter(([_key, value]) =>
        Boolean(value.data?.tags?.includes(tag)),
      ),
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
    const { breadcrumbs } = get();
    const sectionNodes = selectSectionNodes(get());
    const sortedBreadcrumbsBySection: Store.Breadcrumbs[] = [];
    if (selectHasSections(get())) {
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
    const { getSortedBreadcrumbsBySection } = get();
    const sectionNodes = selectSectionNodes(get());
    const sections = getSortedBreadcrumbsBySection();
    const sectionIndex = sections.findIndex((section) =>
      Object.keys(section).includes(nodeId),
    );
    const sectionId = Object.keys(sectionNodes)[sectionIndex];
    const section = sectionNodes[sectionId];
    return section;
  },

  isNavMenuVisible: true,
  setIsNavMenuVisible: (visible: boolean) => set({ isNavMenuVisible: visible }),
});
