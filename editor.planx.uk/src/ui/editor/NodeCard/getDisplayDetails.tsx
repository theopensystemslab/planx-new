import {
  ComponentType,
  IndexedNode,
} from "@opensystemslab/planx-core/types";
import { capitalize } from "lodash";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";

/**
 * Functions to map a search result to the fields required by SearchResultCard
 * TODO: Docs
 */
interface NodeCardFormatter {
  getIconKey: (node: IndexedNode) => ComponentType;
  getTitle: (node: IndexedNode) => string;
  getComponentType: (node: IndexedNode) => string;
}

type ComponentMap = Partial<
  Record<ComponentType, Partial<NodeCardFormatter>>
>;

const componentFormatters: ComponentMap = {
  // Answers are mapped to their parent questions / checklists
  [ComponentType.Answer]: {
    getIconKey: ({ parentId }) => {
      const parentNode = useStore.getState().flow[parentId];
      return parentNode.type!;
    },
    getTitle: ({ parentId }) => {
      const parentNode = useStore.getState().flow[parentId];
      return parentNode.data?.text;
    },
    getComponentType: ({ parentId }) => {
      const parentNode = useStore.getState().flow[parentId];
      const parentType = parentNode.type!;
      const formatted = capitalize(SLUGS[parentType].replaceAll("-", " "));

      return formatted;
    },
  },
};

/**
 * Default formatters for any fields not already covered by key or component-specific formatters
 */
const defaultFormatter: NodeCardFormatter = {
  getIconKey: ({ type }) => type,
  getTitle: ({ data }) =>
    (data?.title as string) || (data?.text as string) || "",
  getComponentType: ({ type }) =>
    capitalize(SLUGS[type].replaceAll("-", " ")),
};

/**
 * Formats a search result for display in the SearchResultCard
 * The values are combined in order of precedence: key-specific, component-specific, then defaults
 */
export const getDisplayDetails = (
  node: IndexedNode,
) => {
  const formatter: NodeCardFormatter = {
    ...defaultFormatter,
    ...componentFormatters[node.type],
  };

  return {
    iconKey: formatter.getIconKey(node),
    componentType: formatter.getComponentType(node),
    title: formatter.getTitle(node),
  };
};
