import { Feature } from "geojson";

export const mockMapGeoJson: Feature = {
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-0.633498, 51.605485],
          [-0.633455, 51.605606],
          [-0.633788, 51.605643],
          [-0.634429, 51.605799],
          [-0.634429, 51.605767],
          [-0.633498, 51.605485],
        ],
      ],
    ],
  },
  type: "Feature",
  properties: {
    "entry-date": "2024-05-06",
    "start-date": "2010-05-12",
    "end-date": "",
    entity: 12000041468,
    name: "",
    dataset: "title-boundary",
    typology: "geography",
    reference: "45211072",
    prefix: "title-boundary",
    "organisation-entity": "13",
  },
};
