import { richText } from "lib/yupExtensions";
import { boolean, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface Content extends BaseNodeData {
  content: string;
  color?: string;
  resetButton?: boolean;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): Content => ({
  content: data?.content || "",
  color: data?.color,
  resetButton: data?.resetButton || false,
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<Content> =
  baseNodeDataValidationSchema.concat(
    object({
      content: richText({ variant: "rootLevelContent" }).required(),
      color: string(),
      resetButton: boolean(),
    }),
  );
