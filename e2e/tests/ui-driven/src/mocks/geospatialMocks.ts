import { OptionWithDataValues } from "../helpers/types";
import { Feature, Polygon, Position } from "geojson";

type ChangeHandlerProperties = {
  label: string;
  "area.squareMetres": number;
  "area.hectares": number;
};

export type GeoJsonChangeHandler = Feature<Polygon, ChangeHandlerProperties>;

export const mockPropertyTypeOptions: OptionWithDataValues[] = [
  { optionText: "Residential", dataValue: "residential" },
  { optionText: "Commercial", dataValue: "commercial" },
];

const mockCoordinates: Position[][][] = [
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
];

export const mockMapGeoJson: Feature = {
  type: "Feature",
  geometry: { type: "MultiPolygon", coordinates: mockCoordinates },
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

export const mockChangedMapGeoJson: GeoJsonChangeHandler = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-0.6341888375038146, 51.60562241658701],
        [-0.6341217822784424, 51.605580770520504],
        [-0.63405472705307, 51.605580770520504],
        [-0.6341888375038146, 51.60562241658701],
      ],
    ],
  },
  properties: {
    label: "1",
    "area.squareMetres": 10.72,
    "area.hectares": 0.001072,
  },
};
