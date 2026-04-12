import { ComponentType, IndexedNode } from "@opensystemslab/planx-core/types";
import { capitalize } from "lodash";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";

/**
 * Functions to map an indexed node to the display fields required by NodeCard
 */
interface NodeCardFormatter {
  getIconKey: (node: IndexedNode) => ComponentType;
  getTitle: (node: IndexedNode) => string;
  getComponentType: (node: IndexedNode) => string;
}

type ComponentMap = Partial<Record<ComponentType, Partial<NodeCardFormatter>>>;

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
  getComponentType: ({ type }) => capitalize(SLUGS[type].replaceAll("-", " ")),
};

/**
 * Formats an IndexedNode for display in the NodeCard
 * The values are combined in order of precedence: key-specific, component-specific, then defaults
 */
export const getDisplayDetailsForNodeCard = (node: IndexedNode) => {
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
