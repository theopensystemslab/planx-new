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

export const point2: Feature<Point, { label: string }> = {
  type: "Feature",
  properties: {
    label: "2",
  },
  geometry: {
    type: "Point",
    coordinates: [-3.686529607119201, 57.15310433687542],
  },
};

export const point3: Feature<Point, { label: string }> = {
  type: "Feature",
  properties: {
    label: "3",
  },
  geometry: {
    type: "Point",
    coordinates: [-3.68689607119201, 57.15310833687542],
  },
};

export const mockFeaturePointObj = `{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"label":"1"},"geometry":{"type":"Point","coordinates":[-3.685929607119201,57.15301433687542]}}]}`;
