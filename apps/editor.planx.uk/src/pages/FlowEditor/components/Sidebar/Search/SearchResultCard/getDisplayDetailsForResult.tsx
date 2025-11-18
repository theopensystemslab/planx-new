import {
  ComponentType,
  flatFlags,
  IndexedNode,
} from "@opensystemslab/planx-core/types";
import { Calculate } from "@planx/components/Calculate/model";
import { SearchResult } from "hooks/useSearch";
import { getDisplayDetailsForNodeCard } from "ui/editor/NodeCard/getDisplayDetailsForNodeCard";

/**
 * Functions to map a search result to the fields required by SearchResultCard
 */
interface SearchResultFormatter {
  getDisplayKey: (result: SearchResult<IndexedNode>) => string;
  getHeadline: (result: SearchResult<IndexedNode>) => string;
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
  "data.categories.title": {},
  "data.steps.title": {
    getDisplayKey: () => "Title (step)",
  },
  "data.steps.description": {
    getDisplayKey: () => "Description (step)",
  },
  "data.steps.url": {
    getDisplayKey: () => "URL (step)",
  },
  "data.fileTypes.name": {
    getDisplayKey: () => "Name (file type)",
  },
  "data.fileTypes.moreInformation.howMeasured": {
    getDisplayKey: () => "How is it defined (file type)",
  },
  "data.fileTypes.moreInformation.policyRef": {
    getDisplayKey: () => "Policy reference (file type)",
  },
  "data.fileTypes.moreInformation.info": {
    getDisplayKey: () => "Why it matters (file type)",
  },
  "data.units": {
    getDisplayKey: () => "Unit type",
  },
  "data.schemaName": {
    getDisplayKey: () => "Schema name",
  },
  "data.schema.fields.data.description": {
    getDisplayKey: () => "Description",
  },
  "data.schema.fields.data.options.data.description": {
    getDisplayKey: () => "Option (description)",
  },
  "data.schema.fields.data.options.text": {
    getDisplayKey: () => "Option",
  },
  "data.tasks.title": {
    getDisplayKey: () => "Title (task)",
  },
  "data.tasks.description": {
    getDisplayKey: () => "Description (task)",
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
  },
  "data.nextSteps.description": {
    getDisplayKey: () => "Description (next steps)",
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
  },
  "data.govPayMetadata.value": {
    getDisplayKey: () => "GOV.UK Pay metadata (value)",
  },
  // Calculate contains both input and output data values
  formula: {
    getDisplayKey: () => "Formula",
    getHeadline: ({ item }) => (item.data as unknown as Calculate).formula,
  },
  // List contains data variables nested within its schema
  "data.schema.fields.data.fn": {
    getDisplayKey: () => "Data",
  },
  "data.schema.fields.data.options.data.val": {
    getDisplayKey: () => "Option (data)",
  },
  "data.ratingQuestion": {
    getDisplayKey: () => "Rating question",
  },
  "data.freeformQuestion": {
    getDisplayKey: () => "Freeform question",
  },
  "data.rule.fn": {
    getDisplayKey: () => "Option (rule data)",
  },
};

const componentFormatters: ComponentMap = {
  // Answers are mapped to their parent questions / checklists
  [ComponentType.Answer]: {
    getDisplayKey: () => "Option (title)",
  },
};

/**
 * Default formatters for any fields not already covered by key or component-specific formatters
 */
const defaultFormatter: SearchResultFormatter = {
  getDisplayKey: () => "Title",
  getHeadline: ({ matchValue }) => matchValue,
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
    key: formatter.getDisplayKey(result),
    headline: formatter.getHeadline(result),
    ...getDisplayDetailsForNodeCard(result.item),
  };
};
