import { FeatureCollection } from "geojson";
import { mockTreeData } from "./GenericValues";
export type MockPayload = { data: { MockFn: FeatureCollection } };

export const mockSingleFeaturePayload: MockPayload = {
  data: {
    MockFn: {
      features: [
        {
          geometry: {
            coordinates: [-3.685929607119201, 57.15301433687542],
            type: "Point",
          },
          properties: { mockTreeData },
          type: "Feature",
        },
      ],
      type: "FeatureCollection",
    },
  },
};
