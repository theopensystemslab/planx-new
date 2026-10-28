import type { FeatureCollection, Geometry } from "geojson";
import { type Feature, type MultiPolygon, type Polygon } from "geojson";

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

export interface BuildingSafetyLevyRatesResponse {
  entities: {
    "local-authority-district": string;
    "previously-developed-land-rate": string;
    "non-previously-developed-land-rate": string;
  }[];
}
