import { ComponentType, flatFlags, IndexedNode } from "@opensystemslab/planx-core/types";
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
  displayKey: (result: SearchResult<IndexedNode>) => string;
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
    displayKey: () => "Data",
  },
  "data.val": {
    displayKey: ({ item }) => item.type === ComponentType.Answer
     ? "Option (data)"
     : "Option"
  },
  "data.fileTypes.fn": {
    displayKey: () => "File type (data)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].fn!
  },
  "data.dataFieldBoundary": {
    displayKey: () => "Field boundary",
  },
  "data.dataFieldArea": {
    displayKey: () => "Field area",
  },
  "data.description": {
    displayKey: ({ item }) => item.type === ComponentType.Answer
      ? "Option (description)"
      : "Description"
  },
  "data.notes": {
    displayKey: () => "Internal notes"
  },
  "data.howMeasured": {
    displayKey: () => "How is it defined"
  },
  "data.policyRef": {
    displayKey: () => "Policy reference"
  },
  "data.info": {
    displayKey: () => "Why it matters"
  },
  "data.steps.title": {
    displayKey: () => "Title (step)",
    getHeadline: ({ item, refIndex }) =>
  (item.data as unknown as NextSteps).steps[refIndex].title
  },
  "data.steps.description": {
    displayKey: () => "Description (step)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as NextSteps).steps[refIndex].description
  },
  "data.steps.url": {
    displayKey: () => "URL (step)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as NextSteps).steps[refIndex].url!
  },
  "data.fileTypes.name": {
    displayKey: () => "Name",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].name
  },
  "data.fileTypes.moreInformation.notes": {
    displayKey: () => "Internal notes",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].moreInformation!.notes!
  },
  "data.fileTypes.moreInformation.howMeasured": {
    displayKey: () => "How is it defined"
  },
  "data.fileTypes.moreInformation.policyRef": {
    displayKey: () => "Policy reference"
  },
  "data.fileTypes.moreInformation.info": {
    displayKey: () => "Why it matters"
  },
  "data.schema.fields.data.description": {
    displayKey: () => "Description",
  },
  "data.schema.fields.data.options.data.description": {
    displayKey: () => "Description",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as ChecklistField).data.options[refIndex].data.description!
  },
  "data.schema.fields.data.options.text": {
    displayKey: () => "Option",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].name
  },
  "data.tasks.title": {
    displayKey: () => "Title",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as TaskList).tasks[refIndex].title
  },
  "data.tasks.description": {
    displayKey: () => "Description",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as TaskList).tasks[refIndex].description
  },
  ...Object.fromEntries(flatFlags.flatMap(({ value }) => [
    [`data.overrides.${value}.description`, {
      displayKey: () => "Description",
    }]
  ])),
  "data.content": {
    displayKey: () => "Content",
  },
  "data.moreInfo": {
    displayKey: () => "More information"
  },
  "data.contactInfo": {
    displayKey: () => "Contact information"
  },
  "data.nextSteps.title": {
    displayKey: () => "Title (next steps)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as Confirmation).nextSteps![refIndex].title
  },
  "data.nextSteps.description": {
    displayKey: () => "Description",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as Confirmation).nextSteps![refIndex].description
  },
  "data.newAddressTitle": {
    displayKey: () => "Title (new address)",
  },
  "data.newAddressDescription": {
    displayKey: () => "Description (new address)",
  },
  "data.newAddressDescriptionLabel": {
    displayKey: () => "Description label (new address)",
  },
  "data.titleForUploading": {
    displayKey: () => "Title for uploading",
  },
  "data.descriptionForUploading": {
    displayKey: () => "Description for uploading",
  },
  "data.disclaimer": {
    displayKey: () => "Disclaimer",
  },
  "data.bannerTitle": {
    displayKey: () => "Banner title"
  },
  "data.instructionsTitle": {
    displayKey: () => "Instructions title"
  },
  "data.instructionsDescription": {
    displayKey: () => "Instructions description"
  },
  "data.secondaryPageTitle": {
    displayKey: () => "Secondary page title"
  },
  "data.nomineeTitle": {
    displayKey: () => "Nominee title"
  },
  "data.nomineeDescription": {
    displayKey: () => "Nominee description"
  },
  "data.yourDetailsTitle": {
    displayKey: () => "Your details title"
  },
  "data.yourDetailsDescription": {
    displayKey: () => "Your details description"
  },
  "data.yourDetailsLabel": {
    displayKey: () => "Your details label"
  },
  // Calculate contains both input and output data values
  formula: {
    displayKey: () => "Formula",
    getHeadline: ({ item }) => (item.data as unknown as Calculate).formula,
  },
  "data.output": {
    displayKey: () => "Output (data)",
    getHeadline: ({ item }) => (item.data as unknown as Calculate).output,
  },
  // List contains data variables nested within its schema
  "data.schema.fields.data.fn": {
    displayKey: () => "Data",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as List).schema.fields[refIndex].data.fn,
  },
  "data.schema.fields.data.options.data.val": {
    displayKey: () => "Option (data)",
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
}

/**
 * Default values for all ComponentTypes not listed in DISPLAY_DATA
 */
const DEFAULT_DATA: DataDisplayValues = {
  displayKey: ({ item }) => item.type === ComponentType.Question
    ? "Option (title)"
    : "Title",
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
    key: data.displayKey(result),
    headline: data.getHeadline(result),
  };
};