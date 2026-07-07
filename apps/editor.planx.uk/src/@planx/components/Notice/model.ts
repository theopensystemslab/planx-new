import { richText } from "lib/yupExtensions";
import type { SchemaOf } from "yup";
import { boolean, object, string } from "yup";

import type { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";

export interface Notice extends BaseNodeData {
  title?: string;
  description: string;
  color: string;
  resetButton?: boolean;
}

export const parseNotice = (data: Record<string, any> | undefined) => ({
  title: data?.title || "",
  description: data?.description || "",
  color: data?.color || "#EFEFEF",
  resetButton: data?.resetButton || false,
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<Notice> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string(),
      description: richText(),
      color: string().required(),
      resetButton: boolean(),
    }),
  );
