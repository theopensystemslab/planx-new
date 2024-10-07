import {
  ComponentType,
  flatFlags,
  IndexedNode,
} from "@opensystemslab/planx-core/types";
import { Calculate } from "@planx/components/Calculate/model";
import { Confirmation } from "@planx/components/Confirmation/model";
import { FileUploadAndLabel } from "@planx/components/FileUploadAndLabel/model";
import { List } from "@planx/components/List/model";
import { NextSteps } from "@planx/components/NextSteps/model";
import { ChecklistField } from "@planx/components/shared/Schema/model";
import { TaskList } from "@planx/components/TaskList/model";
import { SearchResult } from "hooks/useSearch";
import { capitalize, get } from "lodash";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";

interface DataDisplayValues {
  getDisplayKey: (result: SearchResult<IndexedNode>) => string;
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
type ComponentMap = Record<ComponentType, Partial<DataDisplayValues>>;

/**
 * Map of ComponentTypes which need specific overrides in order to display their data values
 */
const KEY_DATA: Partial<DataKeyMap> = {
  "data.fn": {
    getDisplayKey: () => "Data",
  },
  "data.val": {
    getDisplayKey: ({ item }) =>
      item.type === ComponentType.Answer ? "Option (data)" : "Option",
  },
  "data.fileTypes.fn": {
    getDisplayKey: () => "File type (data)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].fn!,
  },
  "data.dataFieldBoundary": {
    getDisplayKey: () => "Field boundary",
  },
  "data.dataFieldArea": {
    getDisplayKey: () => "Field area",
  },
  "data.description": {
    getDisplayKey: ({ item }) =>
      item.type === ComponentType.Answer
        ? "Option (description)"
        : "Description",
  },
  "data.notes": {
    getDisplayKey: () => "Internal notes",
  },
  "data.howMeasured": {
    getDisplayKey: () => "How is it defined",
  },
  "data.policyRef": {
    getDisplayKey: () => "Policy reference",
  },
  "data.info": {
    getDisplayKey: () => "Why it matters",
  },
  "data.steps.title": {
    getDisplayKey: () => "Title (step)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as NextSteps).steps[refIndex].title,
  },
  "data.steps.description": {
    getDisplayKey: () => "Description (step)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as NextSteps).steps[refIndex].description,
  },
  "data.steps.url": {
    getDisplayKey: () => "URL (step)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as NextSteps).steps[refIndex].url!,
  },
  "data.fileTypes.name": {
    getDisplayKey: () => "Name",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].name,
  },
  "data.fileTypes.moreInformation.notes": {
    getDisplayKey: () => "Internal notes",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex]
        .moreInformation!.notes!,
  },
  "data.fileTypes.moreInformation.howMeasured": {
    getDisplayKey: () => "How is it defined",
  },
  "data.fileTypes.moreInformation.policyRef": {
    getDisplayKey: () => "Policy reference",
  },
  "data.fileTypes.moreInformation.info": {
    getDisplayKey: () => "Why it matters",
  },
  "data.schema.fields.data.description": {
    getDisplayKey: () => "Description",
  },
  "data.schema.fields.data.options.data.description": {
    getDisplayKey: () => "Description",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as ChecklistField).data.options[refIndex].data
        .description!,
  },
  "data.schema.fields.data.options.text": {
    getDisplayKey: () => "Option",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].name,
  },
  "data.tasks.title": {
    getDisplayKey: () => "Title",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as TaskList).tasks[refIndex].title,
  },
  "data.tasks.description": {
    getDisplayKey: () => "Description",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as TaskList).tasks[refIndex].description,
  },
  ...Object.fromEntries(
    flatFlags.flatMap(({ value }) => [
      [
        `data.overrides.${value}.description`,
        {
          displayKey: () => "Description",
        },
      ],
    ]),
  ),
  "data.content": {
    getDisplayKey: () => "Content",
  },
  "data.moreInfo": {
    getDisplayKey: () => "More information",
  },
  "data.contactInfo": {
    getDisplayKey: () => "Contact information",
  },
  "data.nextSteps.title": {
    getDisplayKey: () => "Title (next steps)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as Confirmation).nextSteps![refIndex].title,
  },
  "data.nextSteps.description": {
    getDisplayKey: () => "Description",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as Confirmation).nextSteps![refIndex].description,
  },
  "data.newAddressTitle": {
    getDisplayKey: () => "Title (new address)",
  },
  "data.newAddressDescription": {
    getDisplayKey: () => "Description (new address)",
  },
  "data.newAddressDescriptionLabel": {
    getDisplayKey: () => "Description label (new address)",
  },
  "data.titleForUploading": {
    getDisplayKey: () => "Title for uploading",
  },
  "data.descriptionForUploading": {
    getDisplayKey: () => "Description for uploading",
  },
  "data.disclaimer": {
    getDisplayKey: () => "Disclaimer",
  },
  "data.bannerTitle": {
    getDisplayKey: () => "Banner title",
  },
  "data.instructionsTitle": {
    getDisplayKey: () => "Instructions title",
  },
  "data.instructionsDescription": {
    getDisplayKey: () => "Instructions description",
  },
  "data.secondaryPageTitle": {
    getDisplayKey: () => "Secondary page title",
  },
  "data.nomineeTitle": {
    getDisplayKey: () => "Nominee title",
  },
  "data.nomineeDescription": {
    getDisplayKey: () => "Nominee description",
  },
  "data.yourDetailsTitle": {
    getDisplayKey: () => "Your details title",
  },
  "data.yourDetailsDescription": {
    getDisplayKey: () => "Your details description",
  },
  "data.yourDetailsLabel": {
    getDisplayKey: () => "Your details label",
  },
  // Calculate contains both input and output data values
  formula: {
    getDisplayKey: () => "Formula",
    getHeadline: ({ item }) => (item.data as unknown as Calculate).formula,
  },
  "data.output": {
    getDisplayKey: () => "Output (data)",
    getHeadline: ({ item }) => (item.data as unknown as Calculate).output,
  },
  // List contains data variables nested within its schema
  "data.schema.fields.data.fn": {
    getDisplayKey: () => "Data",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as List).schema.fields[refIndex].data.fn,
  },
  "data.schema.fields.data.options.data.val": {
    getDisplayKey: () => "Option (data)",
    getHeadline: ({ item, refIndex }) => {
      // Fuse.js flattens deeply nested arrays when using refIndex
      const options = (item.data as unknown as List).schema.fields
        .filter((field) => field.type === "question")
        .flatMap((field) => field.data.options);
      return options[refIndex].data.val || "";
    },
  },
};

const COMPONENT_DATA: Partial<ComponentMap> = {
  // Answers are mapped to their parent questions
  [ComponentType.Answer]: {
    getIconKey: () => ComponentType.Question,
    getTitle: ({ item }) => {
      const parentNode = useStore.getState().flow[item.parentId];
      return parentNode.data?.text;
    },
  },
};

/**
 * Default values for all ComponentTypes not listed in DISPLAY_DATA
 */
const DEFAULT_DATA: DataDisplayValues = {
  getDisplayKey: ({ item }) =>
    item.type === ComponentType.Question ? "Option (title)" : "Title",
  getIconKey: ({ item }) => item.type,
  getTitle: ({ item }) =>
    (item.data?.title as string) || (item.data?.text as string) || "",
  // TODO: strip html?
  getHeadline: ({ item, key }) => get(item, key)?.toString() || "",
  getComponentType: ({ item }) =>
    capitalize(SLUGS[item.type].replaceAll("-", " ")),
};

export const getDisplayDetailsForResult = (
  result: SearchResult<IndexedNode>,
) => {
  const data: DataDisplayValues = {
    ...DEFAULT_DATA,
    ...COMPONENT_DATA[result.item.type],
    ...KEY_DATA[result.key],
  };

  return {
    iconKey: data.getIconKey(result),
    componentType: data.getComponentType(result),
    title: data.getTitle(result),
    key: data.getDisplayKey(result),
    headline: data.getHeadline(result),
  };
};
