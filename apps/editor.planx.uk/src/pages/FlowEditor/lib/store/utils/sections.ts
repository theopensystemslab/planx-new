import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Section } from "@planx/components/Section/model";
import { SECTION_WEIGHTS } from "@planx/components/Section/model";
import { ROOT_NODE_KEY } from "@planx/graph";
import { findLast, sum } from "lodash";

import type { Store } from "..";

export interface SectionNode extends Store.Node {
  data: Section;
}

export interface Progress {
  completed: number;
  current: number;
}

// Cached per flow object
// A new flow (e.g. a ShareDB sync, or loading a published flow) is only searched for sections once
const cache = new WeakMap<Store.Flow, Record<string, SectionNode>>();

/**
 * Get the sections of a flow, in order
 *
 * Sections can be placed on the root of the flow, or one level deep within a folder
 */
export const getSectionNodes = (
  flow: Store.Flow,
): Record<string, SectionNode> => {
  const cached = cache.get(flow);
  if (cached) return cached;

  const sectionNodes: Record<string, SectionNode> = {};
  const rootEdges = flow[ROOT_NODE_KEY]?.edges || [];

  rootEdges.forEach((nodeId) => {
    const node = flow[nodeId];
    if (!node) return;

    if (node.type === TYPES.Section) {
      // Section directly on the root
      sectionNodes[nodeId] = node as SectionNode;
    } else if (node.type === TYPES.InternalPortal) {
      // Section is within a folder / internal portal
      const folderEdges = node.edges || [];
      folderEdges.forEach((childId) => {
        const childNode = flow[childId];
        if (childNode?.type === TYPES.Section) {
          sectionNodes[childId] = childNode as SectionNode;
        }
      });
    }
  });

  cache.set(flow, sectionNodes);
  return sectionNodes;
};

/**
 * Get the (1-based) index of the section the user is currently in
 *
 * Defaults to the first section until a section has been reached
 */
export const getCurrentSectionIndex = ({
  sectionNodes,
  breadcrumbs,
  currentCard,
}: {
  sectionNodes: Record<string, SectionNode>;
  breadcrumbs: Store.Breadcrumbs;
  currentCard: Store.Node | null;
}): number => {
  const breadcrumbIds = Object.keys(breadcrumbs);
  const sectionIds = Object.keys(sectionNodes);
  const sectionIdsSet = new Set(sectionIds);

  // Transition to a new section index as soon as a section is reached
  // It won't yet be in the breadcrumbs but should count as the starting point of the next section
  const isSectionCardReached = currentCard?.type === TYPES.Section;
  if (isSectionCardReached && currentCard.id)
    breadcrumbIds.push(currentCard.id);

  const mostRecentSectionId = findLast(breadcrumbIds, (breadcrumbId) =>
    sectionIdsSet.has(breadcrumbId),
  );

  if (!mostRecentSectionId) return 1;

  return sectionIds.indexOf(mostRecentSectionId) + 1;
};

/**
 * Calculate progress through the flow, weighted by the length of each section
 */
export const calculateSectionProgress = (
  sectionNodes: Record<string, SectionNode>,
  currentSectionIndex: number,
): Progress | undefined => {
  const sectionWeights = Object.values(sectionNodes).map(
    ({ data: { length = "medium" } }) => SECTION_WEIGHTS[length],
  );
  if (!sectionWeights.length) return;

  // if (isFinalCard()) return { completed: 100, current: 100 };

  // Account for offset index
  const index = currentSectionIndex - 1;

  const totalWeight = sum(sectionWeights);
  const currentWeight = sectionWeights[index];
  const currentPercentage = (currentWeight / totalWeight) * 100;

  const completedWeight = sum(sectionWeights.slice(0, index));
  const completedPercentage = (completedWeight / totalWeight) * 100;

  return { completed: completedPercentage, current: currentPercentage };
};
