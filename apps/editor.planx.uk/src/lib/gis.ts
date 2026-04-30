import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import { Feature, type Polygon } from "geojson";

import type { Entity } from "./planningData/types";

type Projection = "EPSG:3857" | "EPSG:27700";

export type GeoJSONChange = Record<Projection, { features: Feature[] }>;
export type GeoJSONChangeEvent = CustomEvent<GeoJSONChange>;

/**
 * Convert a complex local authority boundary to a simplified bounding box
 */
export const convertToBoundingBox = (feature: Entity): Feature<Polygon> =>
  bboxPolygon(bbox(feature));
