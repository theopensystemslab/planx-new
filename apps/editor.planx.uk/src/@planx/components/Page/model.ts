import { richText } from "lib/yupExtensions";
import { cloneDeep } from "lodash";
import { object, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";
import { Schema } from "../shared/Schema/model";
import { PAGE_SCHEMAS } from "./Editor";

export interface PageSchema extends Schema {
  min: 1;
  max: 1;
}

export interface Page extends BaseNodeData {
  fn: string;
  title: string;
  description?: string;
  schemaName: string;
  schema: PageSchema;
}

export const parsePage = (data: Record<string, any> | undefined): Page => ({
  fn: data?.fn,
  title: data?.title,
  description: data?.description,
  schemaName: data?.schemaName || PAGE_SCHEMAS[0].name,
  schema: cloneDeep(data?.schema) || PAGE_SCHEMAS[0].schema,
  ...parseBaseNodeData(data),
});

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    fn: string().required(),
    title: string().required(),
    description: richText(),
    schemaName: string().required(),
  }),
);
