import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { NodeTag } from "@opensystemslab/planx-core/types";
import { Section } from "@planx/components/Section/model";
import { ROOT_NODE_KEY, sortIdsDepthFirst } from "@planx/graph";
import { findLast, pick, sum } from "lodash";
import { Store } from "pages/FlowEditor/lib/store";
import type { StateCreator } from "zustand";

import { SECTION_WEIGHTS } from "../../../../@planx/components/Section/model";
import { PreviewStore } from "./preview";
import { SharedStore } from "./shared";

export interface SectionNode extends Store.Node {
  data: Section;
}

export interface Progress {
  completed: number;
  current: number;
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
  filterFlowByTag: (tag: NodeTag) => Store.Flow;
  getSortedBreadcrumbsBySection: () => Store.Breadcrumbs[];
  getSectionForNode: (nodeId: string) => SectionNode;
  _getSortedSections: () => Record<string, SectionNode>;
  _calculateSectionProgress: (
    currentSectionIndex: number,
  ) => Progress | undefined;
  sectionProgress: Progress | undefined;
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
    const {
      currentSectionIndex,
      _calculateSectionProgress,
      _getSortedSections,
    } = get();

    const sectionNodes = _getSortedSections();
    const sectionCount = Object.keys(sectionNodes).length;
    const hasSections = Boolean(sectionCount);
    const currentSectionTitle = Object.values(sectionNodes)[0]?.data.title;
    const sectionProgress = _calculateSectionProgress(currentSectionIndex);

    set({
      sectionNodes,
      sectionCount,
      hasSections,
      currentSectionTitle,
      sectionProgress,
    });
  },

  /**
   * Update title and index on record()
   * Triggered when going backwards, forwards, or changing answer
   */
  updateSectionData: () => {
    const {
      breadcrumbs,
      sectionNodes,
      hasSections,
      currentCard,
      _calculateSectionProgress,
    } = get();
    // Sections not being used, do not proceed
    if (!hasSections) return;

    const breadcrumbIds = Object.keys(breadcrumbs);
    const sectionIds = Object.keys(sectionNodes);
    const sectionIdsSet = new Set(sectionIds);

    // Transition to a new section index as soon as a section is reached
    // It won't yet be in the breadcrumbs but should count as the starting point of the next section
    const isSectionCardReached = currentCard?.type === TYPES.Section;
    if (isSectionCardReached) breadcrumbIds.push(currentCard.id);

    const mostRecentSectionId = findLast(
      breadcrumbIds,
      (breadcrumbId: string) => sectionIdsSet.has(breadcrumbId),
    );

    const hasPassedFirstSection = Boolean(mostRecentSectionId);

    // No sections in breadcrumbs, first section values already set in store
    if (!hasPassedFirstSection) return;

    // No sections in breadcrumbs, first section values already set in store
    if (!mostRecentSectionId) return;

    const currentSectionTitle = sectionNodes[mostRecentSectionId].data.title;
    const currentSectionIndex = sectionIds.indexOf(mostRecentSectionId) + 1;
    const sectionProgress = _calculateSectionProgress(currentSectionIndex);

    set({ currentSectionTitle, currentSectionIndex, sectionProgress });
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

  sectionProgress: undefined,

  _calculateSectionProgress: (currentSectionIndex: number) => {
    const { sectionNodes, isFinalCard, sectionCount } = get();
    if (!sectionCount) return;

    // if (isFinalCard()) return { completed: 100, current: 100 };

    // Account for offset index
    const index = currentSectionIndex - 1;

    const sectionWeights = Object.values(sectionNodes).map(
      ({ data: { length = "medium" } }) => SECTION_WEIGHTS[length],
    );
    const totalWeight = sum(sectionWeights);
    const currentWeight = sectionWeights[index];
    const currentPercentage = (currentWeight / totalWeight) * 100;

    const completedWeight = sum(sectionWeights.slice(0, index));
    const completedPercentage = (completedWeight / totalWeight) * 100;

    return { completed: completedPercentage, current: currentPercentage };
  },

  _getSortedSections: () => {
    const { flow } = get();
    const sortedSections: Record<string, SectionNode> = {};
    const rootEdges = flow[ROOT_NODE_KEY]?.edges || [];

    rootEdges.forEach((nodeId) => {
      const node = flow[nodeId];
      if (!node) return;

      if (node.type === TYPES.Section) {
        // Section directly on the root
        sortedSections[nodeId] = node as SectionNode;
      } else if (node.type === TYPES.InternalPortal) {
        // Section is within a folder / internal portal
        const folderEdges = node.edges || [];
        folderEdges.forEach((childId) => {
          const childNode = flow[childId];
          if (childNode?.type === TYPES.Section) {
            sortedSections[childId] = childNode as SectionNode;
          }
        });
      }
    });

    return sortedSections;
  },
});
