import { richText } from "lib/yupExtensions";
import { cloneDeep } from "lodash";
import { number, object, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";
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

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    fn: string().nullable().required(),
    title: string().required(),
    description: richText(),
    schemaName: string().required(),
    schema: object({
      max: number()
        .optional()
        .min(
          2,
          "The maximum must be greater than 1 - a Page component should be used when max is equal to 1",
        ),
    }),
  }),
);
