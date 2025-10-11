import { object, SchemaOf, string } from "yup";

import { BaseNodeData, baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";

export interface ResponsiveChecklist extends BaseNodeData {
  fn: string;
}

export const parseResponsiveChecklist = (
  data: Record<string, any> | undefined
): ResponsiveChecklist => ({
  fn: data?.fn || "",
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<ResponsiveChecklist> = baseNodeDataValidationSchema.concat(
  object({
    fn: string().nullable().required()
  })
);