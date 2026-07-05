import { richText } from "lib/yupExtensions";
import type { SchemaOf } from "yup";
import { boolean, object, string } from "yup";

import type { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";

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
