import cloneDeep from "lodash/cloneDeep";

import { Schema } from "../List/model";
import { MoreInformation, parseMoreInformation } from "../shared";
import { SCHEMAS } from "./Editor";

export interface MapAndLabel extends MoreInformation {
  fn: string;
  title: string;
  description?: string;
  drawColor: string;
  drawType: "Polygon" | "Point";
  schemaName: string;
  schema: Schema;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): MapAndLabel => ({
  fn: data?.fn || "",
  title: data?.title,
  description: data?.description,
  drawColor: data?.drawColor || "#22194D",
  drawType: data?.drawType || "Polygon",
  schemaName: data?.schemaName || SCHEMAS[0].name,
  schema: cloneDeep(data?.schema) || SCHEMAS[0].schema,
  ...parseMoreInformation(data),
});
