import { object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface ResponsiveQuestion extends BaseNodeData {
  fn: string;
}

export const parseResponsiveQuestion = (
  data: Record<string, any> | undefined
): ResponsiveQuestion => ({
  fn: data?.fn || "",
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<ResponsiveQuestion> =
  baseNodeDataValidationSchema.concat(
    object({
      fn: string().nullable().required(),
    })
  );
