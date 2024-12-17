import { OptionWithDataValues } from "../helpers/types";
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

export const mockPropertyConstraints = {
  sourceRequest:
    "https://www.planning.data.gov.uk/entity.json?entries=current&geometry=POINT%28-0.1151501+51.4745098%29&geometry_relation=intersects&exclude_field=geometry%2Cpoint&limit=100&dataset=article-4-direction-area&dataset=central-activities-zone&dataset=brownfield-land&dataset=brownfield-site&dataset=area-of-outstanding-natural-beauty&dataset=conservation-area&dataset=green-belt&dataset=national-park&dataset=world-heritage-site&dataset=world-heritage-site-buffer-zone&dataset=flood-risk-zone&dataset=listed-building&dataset=listed-building-outline&dataset=scheduled-monument&dataset=ancient-woodland&dataset=ramsar&dataset=special-area-of-conservation&dataset=special-protection-area&dataset=site-of-special-scientific-interest&dataset=park-and-garden&dataset=tree&dataset=tree-preservation-order&dataset=tree-preservation-zone",
  constraints: {
    listed: {
      fn: "listed",
      value: true,
      text: "is, or is within, a Listed Building",
      data: [
        {
          "entry-date": "2024-04-16",
          "start-date": "1980-05-15",
          "end-date": "",
          entity: 42103309,
          name: "No Address Supplied",
          dataset: "listed-building-outline",
          typology: "geography",
          reference: "12/435 and 963/1",
          prefix: "listed-building-outline",
          "organisation-entity": "192",
        },
      ],
      category: "Heritage and conservation",
    },
    article4: {
      fn: "article4",
      value: false,
      text: "is not in an Article 4 direction area",
      category: "General policy",
    },
    "article4.caz": {
      fn: "article4.caz",
      value: false,
      text: "is not in the Central Activities Zone",
      category: "General policy",
    },
    brownfieldSite: {
      fn: "brownfieldSite",
      value: false,
      text: "is not on Brownfield land",
      category: "General policy",
    },
    "designated.AONB": {
      fn: "designated.AONB",
      value: false,
      text: "is not in an Area of Outstanding Natural Beauty",
      category: "Heritage and conservation",
    },
    greenBelt: {
      fn: "greenBelt",
      value: false,
      text: "is not in a Green Belt",
      category: "General policy",
    },
    "designated.nationalPark": {
      fn: "designated.nationalPark",
      value: false,
      text: "is not in a National Park",
      category: "Heritage and conservation",
    },
    "designated.nationalPark.broads": {
      fn: "designated.nationalPark.broads",
      value: false,
    },
    "designated.WHS": {
      fn: "designated.WHS",
      value: false,
      text: "is not an UNESCO World Heritage Site",
      category: "Heritage and conservation",
    },
    flood: {
      fn: "flood",
      value: false,
      text: "is not in a Flood Risk Zone",
      category: "Flooding",
    },
    monument: {
      fn: "monument",
      value: false,
      text: "is not the site of a Scheduled Monument",
      category: "Heritage and conservation",
    },
    "nature.ASNW": {
      fn: "nature.ASNW",
      value: false,
      text: "is not in an Ancient Semi-Natural Woodland (ASNW)",
      category: "Ecology",
    },
    "nature.ramsarSite": {
      fn: "nature.ramsarSite",
      value: false,
      text: "is not in a Ramsar Site",
      category: "Ecology",
    },
    "nature.SAC": {
      fn: "nature.SAC",
      value: false,
      text: "is not in a Special Area of Conservation (SAC)",
      category: "Ecology",
    },
    "nature.SPA": {
      fn: "nature.SPA",
      value: false,
      text: "is not in a Special Protection Area (SPA)",
      category: "Ecology",
    },
    "nature.SSSI": {
      fn: "nature.SSSI",
      value: false,
      text: "is not a Site of Special Scientific Interest (SSSI)",
      category: "Ecology",
    },
    registeredPark: {
      fn: "registeredPark",
      value: false,
      text: "is not in a Historic Park or Garden",
      category: "Heritage and conservation",
    },
    tpo: {
      fn: "tpo",
      value: false,
      text: "is not in a Tree Preservation Order (TPO) Zone",
      category: "Trees",
    },
    designated: {
      value: true,
    },
    "listed.grade.I": {
      fn: "listed.grade.I",
      value: false,
    },
    "listed.grade.II": {
      fn: "listed.grade.II",
      value: false,
    },
    "listed.grade.II*": {
      fn: "listed.grade.II*",
      value: false,
    },
  },
  metadata: {
    article4: {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      collection: "article-4-direction",
      dataset: "article-4-direction-area",
      description:
        "Orders made by the local planning authority to remove all or some of the permitted development rights on a site in order to protect it",
      name: "Article 4 direction area",
      plural: "Article 4 direction areas",
      prefix: "",
      text: "A local planning authority may create an [article 4 direction](https://www.gov.uk/guidance/when-is-permission-required#article-4-direction) to alter or remove [permitted development rights](https://www.gov.uk/government/publications/permitted-development-rights-for-householders-technical-guidance) from a building or area.\n\nEach [article 4 direction](/dataset/article-4-direction) may apply to one or more article 4 direction areas.",
      typology: "geography",
      wikidata: "",
      wikipedia: "",
      entities: "",
      themes: ["heritage"],
      "entity-count": {
        dataset: "article-4-direction-area",
        count: 2444,
      },
      "paint-options": "",
      attribution: "crown-copyright",
      "attribution-text": "© Crown copyright and database right 2024",
      licence: "ogl3",
      "licence-text":
        "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      consideration: "article-4-directions",
      "github-discussion": 30,
      "entity-minimum": 7010000000,
      "entity-maximum": 7019999999,
      phase: "beta",
      realm: "dataset",
      "replacement-dataset": "",
      version: "3.0",
    },
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

export const mockDigitalLandURL = `https://api.editor.planx.dev/gis/testing?geom=POINT%28-0.1151501+51.4745098%29&vals=article4%2Carticle4.caz%2CbrownfieldSite%2Cdesignated.AONB%2Cdesignated.conservationArea%2CgreenBelt%2Cdesignated.nationalPark%2Cdesignated.nationalPark.broads%2Cdesignated.WHS%2Cflood%2Clisted%2Cmonument%2Cnature.ASNW%2Cnature.ramsarSite%2Cnature.SAC%2Cnature.SPA%2Cnature.SSSI%2CregisteredPark%2Ctpo%2Croad.classified`;
