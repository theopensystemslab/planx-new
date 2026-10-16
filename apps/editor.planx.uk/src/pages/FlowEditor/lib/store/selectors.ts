import type {
  IndexedNode,
  OrderedFlow,
} from "@opensystemslab/planx-core/types";

import type { PreviewStore } from "./preview";
import type { SharedStore } from "./shared";
import { getIndexedFlow, type IndexedFlow } from "./utils/indexedFlow";
import {
  calculateSectionProgress,
  getCurrentSectionIndex,
  getSectionNodes,
  type Progress,
  type SectionNode,
} from "./utils/sections";

type FlowState = Pick<SharedStore, "flow">;

type NavigationState = Pick<SharedStore, "flow" | "breadcrumbs"> &
  Pick<PreviewStore, "currentCard">;

/**
 * Select the ordered and indexed version of the current flow
 */
export const selectIndexedFlow = (state: FlowState): IndexedFlow =>
  getIndexedFlow(state.flow);

/**
 * Select the nodes of the current flow, sorted top-down
 */
export const selectOrderedFlow = (state: FlowState): OrderedFlow =>
  selectIndexedFlow(state).ordered;

/**
 * Select a single node of the current flow, with its parent, section and internal portal ids
 */
export const selectIndexedNode =
  (id: string) =>
  (state: FlowState): IndexedNode | undefined =>
    selectIndexedFlow(state).nodes[id];

/**
 * Select the sections of the current flow, in order
 */
export const selectSectionNodes = (
  state: FlowState,
): Record<string, SectionNode> => getSectionNodes(state.flow);

export const selectSectionCount = (state: FlowState): number =>
  Object.keys(selectSectionNodes(state)).length;

export const selectHasSections = (state: FlowState): boolean =>
  selectSectionCount(state) > 0;

// Only one version of the flow and breadcrumbs is current at any time, so caching the last inputs is enough
let lastSectionIndex:
  | {
      sectionNodes: Record<string, SectionNode>;
      breadcrumbs: SharedStore["breadcrumbs"];
      currentCard: PreviewStore["currentCard"];
      index: number;
    }
  | undefined;

/**
 * Select the (1-based) index of the section the user is currently in
 * Defaults to the first section until a section is reached
 */
export const selectCurrentSectionIndex = (state: NavigationState): number => {
  const sectionNodes = selectSectionNodes(state);
  const { breadcrumbs, currentCard } = state;

  if (
    lastSectionIndex?.sectionNodes === sectionNodes &&
    lastSectionIndex.breadcrumbs === breadcrumbs &&
    lastSectionIndex.currentCard === currentCard
  ) {
    return lastSectionIndex.index;
  }

  const index = getCurrentSectionIndex({
    sectionNodes,
    breadcrumbs,
    currentCard,
  });
  lastSectionIndex = { sectionNodes, breadcrumbs, currentCard, index };
  return index;
};

export const selectCurrentSectionTitle = (
  state: NavigationState,
): string | undefined =>
  Object.values(selectSectionNodes(state))[selectCurrentSectionIndex(state) - 1]
    ?.data.title;

let lastSectionProgress:
  | {
      sectionNodes: Record<string, SectionNode>;
      index: number;
      progress: Progress | undefined;
    }
  | undefined;

/**
 * Select progress through the current flow, weighted by section length
 */
export const selectSectionProgress = (
  state: NavigationState,
): Progress | undefined => {
  const sectionNodes = selectSectionNodes(state);
  const index = selectCurrentSectionIndex(state);

  if (
    lastSectionProgress?.sectionNodes === sectionNodes &&
    lastSectionProgress.index === index
  ) {
    return lastSectionProgress.progress;
  }

  const progress = calculateSectionProgress(sectionNodes, index);
  lastSectionProgress = { sectionNodes, index, progress };
  return progress;
};
