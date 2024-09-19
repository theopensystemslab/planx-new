type SearchFacets = string[]

const generalData: SearchFacets = ["data.fn", "data.val"];

const fileUploadAndLabelData: SearchFacets = ["data.fileTypes.fn"];

const calculateData: SearchFacets = [
  "data.output",
  // Can't pass functions to workers!
  // {
  //   name: "formula",
  //   getFn: (node: IndexedNode) => Object.keys(node.data?.defaults || {}),
  // },
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
export const DATA_FACETS = [
  ...generalData,
  ...fileUploadAndLabelData,
  ...calculateData,
  ...listData,
  ...drawBoundaryData,
];
