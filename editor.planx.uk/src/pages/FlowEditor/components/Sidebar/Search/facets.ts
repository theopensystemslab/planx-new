import { flatFlags, IndexedNode } from "@opensystemslab/planx-core/types";
import { FuseOptionKey } from "fuse.js";

export type SearchFacets = Array<FuseOptionKey<IndexedNode>>;

const generalData: SearchFacets = ["data.fn", "data.val"];

const fileUploadAndLabelData: SearchFacets = ["data.fileTypes.fn"];

const calculateData: SearchFacets = [
  "data.output",
  {
    name: "formula",
    getFn: (node: IndexedNode) => Object.keys(node.data?.defaults || {}),
  },
];

const listData: SearchFacets = [
  "data.schema.fields.data.fn",
  "data.schema.fields.data.options.data.val",
];

const drawBoundaryData: SearchFacets = [
  "data.dataFieldBoundary",
  "data.dataFieldArea",
];

/** Data fields used across PlanX components */
export const DATA_FACETS: SearchFacets = [
  ...generalData,
  ...fileUploadAndLabelData,
  ...calculateData,
  ...listData,
  ...drawBoundaryData,
];

const basicFields: SearchFacets = [
  "data.text",
  "data.title",
  "data.description",
];

const moreInformation: SearchFacets = [
  "data.notes",
  "data.howMeasured",
  "data.policyRef",
  "data.info",
];

const checklist: SearchFacets = ["data.categories.title"];

const nextSteps: SearchFacets = [
  "data.steps.title",
  "data.steps.description",
  "data.steps.url",
];

const fileUploadAndLabel: SearchFacets = [
  "data.fileTypes.name",
  "data.fileTypes.moreInformation.howMeasured",
  "data.fileTypes.moreInformation.policyRef",
  "data.fileTypes.moreInformation.info",
];

const numberInput: SearchFacets = [
  "data.units",
];

/** List, Page, and MapAndLabel components share this structure */
const schemaComponents: SearchFacets = [
  // "data.schemaName",
  "data.schema.fields.data.title",
  "data.schema.fields.data.description",
  "data.schema.fields.data.options.data.description",
  // "data.schema.fields.data.options.text",
  "data.schema.fields.data.options.data.text",
];

const taskList: SearchFacets = ["data.tasks.title", "data.tasks.description"];

const result: SearchFacets = [
  ...flatFlags.flatMap(({ value }) => [
    `data.overrides.${value}.heading`,
    `data.overrides.${value}.description`,
  ]),
];

const content: SearchFacets = ["data.content"];

const confirmation: SearchFacets = [
  "data.heading",
  "data.moreInfo",
  "data.contactInfo",
  "data.nextSteps.title",
  "data.nextSteps.description",
];

const findProperty: SearchFacets = [
  "data.newAddressTitle",
  "data.newAddressDescription",
  "data.newAddressDescriptionLabel",
];

const drawBoundary: SearchFacets = [
  "data.titleForUploading",
  "data.descriptionForUploading",
];

const planningConstraints: SearchFacets = ["data.disclaimer"];

const pay: SearchFacets = [
  "data.bannerTitle",
  "data.instructionsTitle",
  "data.instructionsDescription",
  "data.secondaryPageTitle",
  "data.nomineeTitle",
  "data.nomineeDescription",
  "data.yourDetailsTitle",
  "data.yourDetailsDescription",
  "data.yourDetailsLabel",
  // TODO: GovPay metadata?
];

export const ALL_FACETS: SearchFacets = [
  ...basicFields,
  ...moreInformation,
  ...checklist,
  ...nextSteps,
  ...fileUploadAndLabel,
  ...numberInput,
  ...schemaComponents,
  ...taskList,
  ...result,
  ...content,
  ...confirmation,
  ...findProperty,
  ...drawBoundary,
  ...planningConstraints,
  ...pay,
  ...DATA_FACETS,
];
