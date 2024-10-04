import { cloneDeep } from "lodash";
import { number, object } from "yup";

import { BaseNodeData, parseBaseNodeData } from "../shared";
import { Schema } from "../shared/Schema/model";
import { SCHEMAS } from "./Editor";

export interface List extends BaseNodeData {
  fn: string;
  title: string;
  description?: string;
  schemaName: string;
  schema: Schema;
}

export const parseContent = (data: Record<string, any> | undefined): List => ({
  fn: data?.fn,
  title: data?.title,
  description: data?.description,
  schemaName: data?.schemaName || SCHEMAS[0].name,
  schema: cloneDeep(data?.schema) || SCHEMAS[0].schema,
  ...parseBaseNodeData(data),
});

export const validationSchema = object({
  schema: object({
    max: number()
      .optional()
      .min(
        2,
        "The maximum must be greater than 1 - a Page component should be used when max is equal to 1",
      ),
  }),
});
