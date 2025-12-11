import {
  type Feature,
  FeatureCollection,
  Geometry,
  type MultiPolygon,
  type Polygon,
} from "geojson";

export interface SearchEntityParams {
  latitude: number;
  longitude: number;
  datasets: string[];
  // TODO: is this deprecated / removed?
  entries: "all";
  /**
   * @description DE-9IM spatial relationship
   */
  geometryRelation: "intersects";
  limit?: number;
}

export type SearchEntityResponse = FeatureCollection<
  Geometry,
  { dataset: string; name: string }
>;

export type Entity = Feature<Polygon | MultiPolygon, Record<string, unknown>>;
