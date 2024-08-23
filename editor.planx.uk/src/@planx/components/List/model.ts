import { cloneDeep } from "lodash";

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
