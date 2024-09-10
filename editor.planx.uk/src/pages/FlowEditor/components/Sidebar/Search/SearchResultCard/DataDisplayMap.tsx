import { ComponentType, IndexedNode } from "@opensystemslab/planx-core/types";
import { SearchResult } from "hooks/useSearch";
import { capitalize, get } from "lodash";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";

interface DataDisplayValues {
  displayKey: string;
  getIconKey: (result: SearchResult<IndexedNode>) => ComponentType;
  getTitle: (result: SearchResult<IndexedNode>) => string;
  getHeadline: (result: SearchResult<IndexedNode>) => string;
  getComponentType: (result: SearchResult<IndexedNode>) => string;
}

/**
 * Map of data keys to their associated display values
 * Uses Partial<DataDisplayValues> as not all values are unique, we later apply defaults
 */
type DataKeyMap = Record<string, Partial<DataDisplayValues>>;

/**
 * Map of ComponentTypes to their associated data keys
 */
type ComponentMap = Record<ComponentType, DataKeyMap>;

/**
 * Map of ComponentTypes which need specific overrides in order to display their data values
 */
const DISPLAY_DATA: Partial<ComponentMap> = {
  // Answers are mapped to their parent questions
  [ComponentType.Answer]: {
    default: {
      getIconKey: () => ComponentType.Question,
      displayKey: "Option (data)",
      getTitle: ({ item }) => {
        const parentNode = useStore.getState().flow[item.parentId];
        return parentNode!.data.text!;
      },
      getHeadline: ({ item, key }) => get(item, key)?.toString(),
    },
  },
  // FileUploadAndLabel has data values nested in FileTypes
  [ComponentType.FileUploadAndLabel]: {
    default: {
      displayKey: "File type (data)",
      getHeadline: ({ item, refIndex }) =>
        (item["data"]?.["fileTypes"] as [])[refIndex]["fn"],
    },
  },
  // Calculate contains both input and output data values
  [ComponentType.Calculate]: {
    formula: {
      displayKey: "Formula",
      getHeadline: ({ item }) => item.data!.formula as string,
    },
    "data.output": {
      displayKey: "Output (data)",
      getHeadline: ({ item }) => item.data!.output as string,
    },
  },
  // List contains data variables nested within its schema
  [ComponentType.List]: {
    "data.schema.fields.data.fn": {
      getHeadline: ({ item, refIndex }) => {
        // TODO: Add type guards, remove "as"
        return (item.data as any).schema.fields[refIndex].data.fn;
      },
    },
    "data.schema.fields.data.options.data.val": {
      displayKey: "Option (data)",
      getHeadline: ({ item, refIndex }) => {
        // Fuse.js flattens deeply nested arrays when using refIndex
        // TODO: Add type guards, remove "as"
        const options = (item.data as any).schema.fields.flatMap(
          (field: any) => field.data.options,
        );
        return options[refIndex].data.val;
      },
    },
  },
};

/**
 * Default values for all ComponentTypes not listed in DISPLAY_DATA
 */
const DEFAULT_DISPLAY_DATA: DataDisplayValues = {
  displayKey: "Data",
  getIconKey: ({ item }) => item.type,
  getTitle: ({ item }) =>
    (item.data?.title as string) || (item.data?.text as string) || "",
  getHeadline: ({ item, key }) => get(item, key)?.toString() || "",
  getComponentType: ({ item }) =>
    capitalize(SLUGS[item.type].replaceAll("-", " ")),
};

export const getDisplayDetailsForResult = (
  result: SearchResult<IndexedNode>,
) => {
  const componentMap = DISPLAY_DATA[result.item.type];
  const keyMap = componentMap?.[result.key] || componentMap?.default || {};

  const data: DataDisplayValues = {
    ...DEFAULT_DISPLAY_DATA,
    ...keyMap,
  };

  return {
    iconKey: data.getIconKey(result),
    componentType: data.getComponentType(result),
    title: data.getTitle(result),
    key: data.displayKey,
    headline: data.getHeadline(result),
  };
};
