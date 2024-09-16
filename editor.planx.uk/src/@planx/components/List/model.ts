import { cloneDeep } from "lodash";
import { number, object } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";
import { Schema } from "../shared/Schema/model";
import { SCHEMAS } from "./Editor";

export interface List extends MoreInformation {
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
  ...parseMoreInformation(data),
});

export const validationSchema = object({
  schema: object({
    max: number().optional().min(2, "Please use a Page component - the maximum must be greater than 1 item"),
  }),
});