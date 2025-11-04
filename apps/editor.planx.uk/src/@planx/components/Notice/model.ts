import { richText } from "lib/yupExtensions";
import { boolean, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

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
