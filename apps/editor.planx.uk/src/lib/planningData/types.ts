import type { FeatureCollection, Geometry } from "geojson";
import { type Feature, type MultiPolygon, type Polygon } from "geojson";
import { z } from "zod";

export interface SearchEntityParams {
  latitude: number;
  longitude: number;
  datasets: string[];
  /**
   * @description DE-9IM spatial relationship
   */
  geometryRelation: "intersects";
  limit?: number;
}

export type SearchEntityResponse = FeatureCollection<
  Geometry,
  { dataset: string; name: string; reference: string }
>;

export type Entity = Feature<Polygon | MultiPolygon, Record<string, unknown>>;

export interface SearchEntityResponseExcludeGeom {
  entities: {
    entity: number;
    name: string;
    dataset: string;
  }[];
}

const buildingSafetyLevyRateSchema = z.object({
  // Optional because some entities don't have a local-authority-district property
  "local-authority-district": z.string().optional(),
  "previously-developed-land-rate": z
    .string()
    .transform(Number)
    .pipe(z.number().positive()),
  "non-previously-developed-land-rate": z
    .string()
    .transform(Number)
    .pipe(z.number().positive()),
});

export const buildingSafetyLevyRatesResponseSchema = z.object({
  entities: z.array(buildingSafetyLevyRateSchema),
});
