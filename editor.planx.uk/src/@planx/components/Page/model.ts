import { cloneDeep } from "lodash";

import { MoreInformation, parseMoreInformation } from "../shared";
import { Schema } from "../shared/Schema/model";
import { PAGE_SCHEMAS } from "./Editor";

export interface PageSchema extends Schema {
  min: 1;
  max: 1;
}

export interface Page extends MoreInformation {
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
  ...parseMoreInformation(data),
});
