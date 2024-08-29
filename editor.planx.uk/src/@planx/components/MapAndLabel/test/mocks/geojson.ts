import { Feature, Point } from "geojson";

export const point1: Feature<Point, { label: string }> = {
  type: "Feature",
  properties: {
    label: "1",
  },
  geometry: {
    type: "Point",
    coordinates: [-3.685929607119201, 57.15301433687542],
  },
};
