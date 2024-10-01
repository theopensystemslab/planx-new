import { IndexedNode } from "@opensystemslab/planx-core/types";
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

export const ALL_FACETS: SearchFacets = [
  ...basicFields,
  ...moreInformation,
  ...DATA_FACETS,
];
