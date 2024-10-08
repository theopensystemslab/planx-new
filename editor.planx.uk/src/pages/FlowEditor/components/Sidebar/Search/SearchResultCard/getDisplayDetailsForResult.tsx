import {
  ComponentType,
  flatFlags,
  IndexedNode,
} from "@opensystemslab/planx-core/types";
import { Calculate } from "@planx/components/Calculate/model";
import { Checklist } from "@planx/components/Checklist/model";
import { Confirmation } from "@planx/components/Confirmation/model";
import { FileUploadAndLabel } from "@planx/components/FileUploadAndLabel/model";
import { List } from "@planx/components/List/model";
import { NextSteps } from "@planx/components/NextSteps/model";
import { Pay } from "@planx/components/Pay/model";
import { Schema } from "@planx/components/shared/Schema/model";
import { TaskList } from "@planx/components/TaskList/model";
import { SearchResult } from "hooks/useSearch";
import { capitalize } from "lodash";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";

/**
 * Functions to map a search result to the fields required by SearchResultCard
 */
interface SearchResultFormatter {
  getDisplayKey: (result: SearchResult<IndexedNode>) => string;
  getIconKey: (result: SearchResult<IndexedNode>) => ComponentType;
  getTitle: (result: SearchResult<IndexedNode>) => string;
  getHeadline: (result: SearchResult<IndexedNode>) => string;
  getComponentType: (result: SearchResult<IndexedNode>) => string;
}

type KeyMap = Record<string, Partial<SearchResultFormatter>>;

type ComponentMap = Partial<
  Record<ComponentType, Partial<SearchResultFormatter>>
>;

const keyFormatters: KeyMap = {
  "data.fn": {
    getDisplayKey: () => "Data",
  },
  "data.val": {
    getDisplayKey: () => "Option (data)",
  },
  "data.fileTypes.fn": {
    getDisplayKey: () => "File type (data)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].fn!,
  },
  "data.dataFieldBoundary": {
    getDisplayKey: () => "Boundary",
  },
  "data.dataFieldArea": {
    getDisplayKey: () => "Area",
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
  "data.categories.title": {
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as Checklist).categories![refIndex].title,
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
    getDisplayKey: () => "Name (file type)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex].name,
  },
  "data.fileTypes.moreInformation.howMeasured": {
    getDisplayKey: () => "How is it defined (file type)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex]
        .moreInformation!.howMeasured!,
  },
  "data.fileTypes.moreInformation.policyRef": {
    getDisplayKey: () => "Policy reference (file type)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex]
        .moreInformation!.policyRef!,
  },
  "data.fileTypes.moreInformation.info": {
    getDisplayKey: () => "Why it matters (file type)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as FileUploadAndLabel).fileTypes[refIndex]
        .moreInformation!.info!,
  },
  "data.units": {
    getDisplayKey: () => "Unit type",
  },
  "data.schemaName": {
    getDisplayKey: () => "Schema name",
  },
  "data.schema.fields.data.title": {
    getHeadline: ({ item, refIndex }) =>
      (item.data?.schema as unknown as Schema).fields[refIndex].data.title,
  },
  "data.schema.fields.data.description": {
    getDisplayKey: () => "Description",
    getHeadline: ({ item, refIndex }) =>
      (item.data?.schema as unknown as Schema).fields[refIndex].data
        .description!,
  },
  "data.schema.fields.data.options.data.description": {
    getDisplayKey: () => "Option (description)",
    getHeadline: ({ item, refIndex }) => {
      const options = (item.data?.schema as unknown as Schema).fields
        .filter(
          (field) => field.type === "question" || field.type === "checklist",
        )
        .flatMap((field) => field.data.options);
      return options[refIndex].data.description || "";
    },
  },
  "data.schema.fields.data.options.text": {
    getDisplayKey: () => "Option",
    getHeadline: ({ item, refIndex }) => {
      const options = (item.data?.schema as unknown as Schema).fields
        .filter(
          (field) => field.type === "question" || field.type === "checklist",
        )
        .flatMap((field) => field.data.options);
      return options[refIndex].data.text || "";
    },
  },
  "data.tasks.title": {
    getDisplayKey: () => "Title (task)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as TaskList).tasks[refIndex].title,
  },
  "data.tasks.description": {
    getDisplayKey: () => "Description (task)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as TaskList).tasks[refIndex].description,
  },
  ...Object.fromEntries(
    flatFlags.flatMap(({ value }) => [
      [
        `data.overrides.${value}.heading`,
        {
          getDisplayKey: () => `Heading (${value} flag)`,
        },
      ],
      [
        `data.overrides.${value}.description`,
        {
          getDisplayKey: () => `Description (${value} flag)`,
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
    getDisplayKey: () => "Description (next steps)",
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
    getDisplayKey: () => "Title (your details)",
  },
  "data.yourDetailsDescription": {
    getDisplayKey: () => "Description (your details)",
  },
  "data.yourDetailsLabel": {
    getDisplayKey: () => "Label (your details)",
  },
  "data.govPayMetadata.key": {
    getDisplayKey: () => "GOV.UK Pay metadata (key)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as Pay).govPayMetadata[refIndex].key,
  },
  "data.govPayMetadata.value": {
    getDisplayKey: () => "GOV.UK Pay metadata (value)",
    getHeadline: ({ item, refIndex }) =>
      (item.data as unknown as Pay).govPayMetadata[refIndex].value.toString(),
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

const componentFormatters: ComponentMap = {
  // Answers are mapped to their parent questions / checklists
  [ComponentType.Answer]: {
    getDisplayKey: () => "Option (title)",
    getIconKey: ({ item }) => {
      const parentNode = useStore.getState().flow[item.parentId];
      return parentNode.type!;
    },
    getTitle: ({ item }) => {
      const parentNode = useStore.getState().flow[item.parentId];
      return parentNode.data?.text;
    },
    getComponentType: ({ item }) => {
      const parentNode = useStore.getState().flow[item.parentId];
      const parentType = parentNode.type!;
      const formatted = capitalize(SLUGS[parentType].replaceAll("-", " "));

      return formatted;
    },
  },
};

/**
 * Default formatters for any fields not already covered by key or component-specific formatters
 */
const defaultFormatter: SearchResultFormatter = {
  getDisplayKey: () => "Title",
  getIconKey: ({ item }) => item.type,
  getTitle: ({ item }) =>
    (item.data?.title as string) || (item.data?.text as string) || "",
  getHeadline: ({ matchValue }) => matchValue,
  getComponentType: ({ item }) =>
    capitalize(SLUGS[item.type].replaceAll("-", " ")),
};

/**
 * Formats a search result for display in the SearchResultCard
 * The values are combined in order of precedence: key-specific, component-specific, then defaults
 */
export const getDisplayDetailsForResult = (
  result: SearchResult<IndexedNode>,
) => {
  const formatter: SearchResultFormatter = {
    ...defaultFormatter,
    ...componentFormatters[result.item.type],
    ...keyFormatters[result.key],
  };

  return {
    iconKey: formatter.getIconKey(result),
    componentType: formatter.getComponentType(result),
    title: formatter.getTitle(result),
    key: formatter.getDisplayKey(result),
    headline: formatter.getHeadline(result),
  };
};
