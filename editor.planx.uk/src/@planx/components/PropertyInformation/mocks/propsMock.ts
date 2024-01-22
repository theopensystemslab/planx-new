import { PresentationalProps } from "../Public";

export const presentationalPropsMock: Pick<
  PresentationalProps,
  | "title"
  | "description"
  | "address"
  | "propertyType"
  | "localAuthorityDistrict"
  | "titleBoundary"
> = {
  title: "About the property",
  description: "This is the information we currently have about the property",
  address: {
    uprn: "200003497830",
    town: "LONDON",
    y: 177898.62376470293,
    x: 533662.1449918789,
    street: "COBOURG ROAD",
    sao: "",
    postcode: "SE5 0HU",
    pao: "103",
    organisation: "",
    blpu_code: "PP",
    latitude: 51.4842536,
    longitude: -0.0764165,
    single_line_address: "103 COBOURG ROAD, LONDON, SE5 0HU",
    title: "103 COBOURG ROAD, LONDON",
    planx_description: "HMO Parent",
    planx_value: "residential.HMO.parent",
    source: "os",
  },
  propertyType: ["residential.HMO.parent"],
  localAuthorityDistrict: ["Southwark"],
  titleBoundary: {
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-0.076691, 51.484197],
            [-0.075933, 51.484124],
            [-0.075856, 51.484369],
            [-0.075889, 51.484372],
            [-0.0759, 51.484324],
            [-0.076391, 51.484369],
            [-0.076388, 51.484383],
            [-0.076644, 51.484409],
            [-0.076691, 51.484197],
          ],
        ],
      ],
    },
    type: "Feature",
    properties: {
      "entry-date": "2023-12-12",
      "start-date": "2011-08-25",
      "end-date": "",
      entity: 12000601059,
      name: "",
      dataset: "title-boundary",
      typology: "geography",
      reference: "52725257",
      prefix: "title-boundary",
      "organisation-entity": "13",
    },
  },
};
