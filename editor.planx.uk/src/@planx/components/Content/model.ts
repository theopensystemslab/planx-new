import { richText } from "lib/yupExtensions";
import { object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface Content extends BaseNodeData {
  content: string;
  color?: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): Content => ({
  content: data?.content || "",
  color: data?.color,
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<Content> =
  baseNodeDataValidationSchema.concat(
    object({
      content: richText({ variant: "rootLevelContent" }).required(),
      color: string(),
    }),
  );
