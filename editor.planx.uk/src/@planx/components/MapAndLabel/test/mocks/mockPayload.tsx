import { FeatureCollection } from "geojson";

import { mockTreeData } from "./GenericValues";
export interface MockPayload {
  data: { MockFn: FeatureCollection };
}

interface PreviousData extends MockPayload {
  auto: boolean;
}

export const mockSingleFeaturePayload: MockPayload = {
  data: {
    MockFn: {
      features: [
        {
          geometry: {
            coordinates: [-3.685929607119201, 57.15301433687542],
            type: "Point",
          },
          properties: { mockTreeData, label: "1" },
          type: "Feature",
        },
      ],
      type: "FeatureCollection",
    },
  },
};

export const previousMockDoubleFeatureData: MockPayload = {
  data: {
    MockFn: {
      features: [
        {
          geometry: {
            coordinates: [-3.685929607119201, 57.15301433687542],
            type: "Point",
          },
          properties: { mockTreeData, label: "1" },
          type: "Feature",
        },
        {
          type: "Feature",
          properties: { ...mockTreeData, label: "2" },
          geometry: {
            type: "Point",
            coordinates: [-3.686529607119201, 57.15310433687542],
          },
        },
      ],
      type: "FeatureCollection",
    },
  },
};

export const previouslySubmittedSingleData: PreviousData = {
  auto: false,
  ...mockSingleFeaturePayload,
};

export const previouslySubmittedDoubleData: PreviousData = {
  auto: false,
  ...previousMockDoubleFeatureData,
};
