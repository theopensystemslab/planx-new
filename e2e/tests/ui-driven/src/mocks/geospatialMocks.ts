import { OptionWithDataValues } from "../helpers/types.js";
import { Feature, Polygon } from "geojson";

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

export const mockTitleBoundaryGeoJson: Feature = {
  type: "Feature",
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

export const mockRoadData = {
  sourceRequest:
    "https://api.os.uk/features/v1/wfs?service=WFS&request=GetFeature&version=2.0.0&typeNames=Highways_RoadLink&outputFormat=GEOJSON&srsName=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A4326&count=1&filter=%0A++++%3Cogc%3AFilter%3E%0A++++++%3Cogc%3APropertyIsLike+wildCard%3D%22%25%22+singleChar%3D%22%23%22+escapeChar%3D%22%21%22%3E%0A++++++++%3Cogc%3APropertyName%3EFormsPartOf%3C%2Fogc%3APropertyName%3E%0A++++++++%3Cogc%3ALiteral%3E%25Street%23usrn21900651%25%3C%2Fogc%3ALiteral%3E%0A++++++%3C%2Fogc%3APropertyIsLike%3E%0A++++%3C%2Fogc%3AFilter%3E%0A++&",
  metadata: {
    "road.classified": {
      name: "Classified road",
      plural: "Classified roads",
      text: "This will effect your project if you are looking to add a dropped kerb. It may also impact some agricultural or forestry projects within 25 metres of a classified road.",
    },
  },
  constraints: {
    "road.classified": {
      fn: "road.classified",
      value: false,
      text: "is not on a Classified Road",
      category: "General policy",
    },
  },
};
