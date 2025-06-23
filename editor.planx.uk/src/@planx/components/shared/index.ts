import {
  Flag,
  NODE_TAGS,
  NodeTags,
  TemplatedNodeData,
} from "@opensystemslab/planx-core/types";
import { richText } from "lib/yupExtensions";
import trim from "lodash/trim";
import { Store } from "pages/FlowEditor/lib/store";
import { array, boolean, object, SchemaOf, string } from "yup";

/** Shared properties across all node types */
export type BaseNodeData = NodeTags & TemplatedNodeData & MoreInformation;

export interface MoreInformation {
  howMeasured?: string;
  policyRef?: string;
  info?: string;
  notes?: string;
  definitionImg?: string;
}

export const parseBaseNodeData = (
  data: Store.Node["data"] | undefined,
): BaseNodeData => ({
  notes: data?.notes,
  definitionImg: data?.definitionImg,
  howMeasured: data?.howMeasured,
  policyRef: data?.policyRef,
  info: data?.info,
  tags: data?.tags || [],
  isTemplatedNode: data?.isTemplatedNode,
  templatedNodeInstructions: data?.templatedNodeInstructions,
  areTemplatedNodeInstructionsRequired:
    data?.areTemplatedNodeInstructionsRequired,
});

/**
 * Yup validation schema describing BaseNodeData fields
 */
export const baseNodeDataValidationSchema: SchemaOf<BaseNodeData> = object({
  // NodeTags
  tags: array()
    .of(
      string()
        .oneOf([...NODE_TAGS], "Invalid tag")
        .required("Tag cannot be empty"),
    )
    .optional()
    .default([]),

  // TemplatedNodeData
  isTemplatedNode: boolean().optional(),
  templatedNodeInstructions: string().optional(),
  areTemplatedNodeInstructionsRequired: boolean().optional(),

  // MoreInformation
  howMeasured: richText({ required: false }),
  policyRef: richText({ required: false }),
  info: richText({ required: false }),
  notes: richText({ required: false }),
  definitionImg: string().optional(),
});

export interface Option {
  id: string;
  data: {
    description?: string;
    flags?: Array<Flag["value"]>;
    img?: string;
    text: string;
    val?: string;
    exclusive?: true;
  };
}

export const parseFormValues = (ob: any, defaultValues = {}) =>
  ob.reduce((acc: any, [k, v]: any) => {
    if (typeof v === "string") {
      // Remove trailing lines (whitespace)
      // and non-ASCII characters https://stackoverflow.com/a/44472084
      v = trim(v).replace(/[\u{0080}-\u{FFFF}]/gu, "");
      // don't store empty fields
      if (v) acc[k] = v;
    } else if (Array.isArray(v)) {
      // if it's an array (i.e. options)
      acc[k] = v
        // only store fields that have values
        .map((o) => parseFormValues(Object.entries(o)))
        // don't store options with no values
        .filter((o) => Object.keys(o).length > 0);
    } else {
      // it's a number or boolean etc
      acc[k] = v;
    }
    return acc;
  }, defaultValues);
