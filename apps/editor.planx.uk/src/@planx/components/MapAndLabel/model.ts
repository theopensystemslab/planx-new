import { richText } from "lib/yupExtensions";
import cloneDeep from "lodash/cloneDeep";
import { object, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";
import { Schema } from "../shared/Schema/model";
import { SCHEMAS } from "./Editor";

export interface MapAndLabel extends BaseNodeData {
  fn: string;
  title: string;
  description?: string;
  basemap: "OSVectorTile" | "OSRaster" | "MapboxSatellite" | "OSM";
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
  basemap: data?.basemap || "OSVectorTile",
  drawColor: data?.drawColor || "#22194D",
  drawType: data?.drawType || "Polygon",
  schemaName: data?.schemaName || SCHEMAS[0].name,
  schema: cloneDeep(data?.schema) || SCHEMAS[0].schema,
  ...parseBaseNodeData(data),
});

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    fn: string().nullable().required(),
    title: string().required(),
    description: richText(),
    basemap: string()
      .oneOf(["OSVectorTile", "OSRaster", "MapboxSatellite", "OSM"])
      .required(),
    drawColor: string().required(),
    drawType: string().oneOf(["Polygon", "Point"]).required(),
    schemaName: string().required(),
  }),
);
