import { cloneDeep, merge } from "lodash";
import { Store } from "pages/FlowEditor/lib/store";

export const simpleFlow: Store.Flow = {
  _root: {
    edges: ["findProperty", "planningConstraints"],
  },
  findProperty: {
    type: 9,
    data: {
      title: "Find the property",
      allowNewAddresses: false,
      newAddressTitle:
        "Click or tap at where the property is on the map and name it below",
      newAddressDescription:
        "You will need to select a location and provide a name to continue",
      newAddressDescriptionLabel: "Name the site",
    },
  },
  planningConstraints: {
    type: 11,
    data: {
      title: "Planning constraints",
      description:
        "Planning constraints might limit how you can develop or use the property",
      fn: "property.constraints.planning",
      disclaimer:
        "<p>This page does not include information about historic planning conditions that may apply to this property.</p>",
    },
  },
};

export const simpleBreadcrumbs: Store.Breadcrumbs = {
  findProperty: {
    auto: false,
    data: {
      _address: {
        uprn: "100071417680",
        usrn: "2702440",
        blpu_code: "2",
        latitude: 52.4804358,
        longitude: -1.9034539,
        organisation: null,
        sao: "",
        saoEnd: "",
        pao: "COUNCIL HOUSE",
        paoEnd: "",
        street: "VICTORIA SQUARE",
        town: "BIRMINGHAM",
        postcode: "B1 1BB",
        ward: "E05011151",
        x: 406653.64,
        y: 286948.41,
        planx_description: "Local Government Service",
        planx_value: "commercial.office.workspace.gov.local",
        single_line_address:
          "COUNCIL HOUSE, VICTORIA SQUARE, BIRMINGHAM, B1 1BB",
        title: "COUNCIL HOUSE, VICTORIA SQUARE",
        source: "os",
      },
      "property.type": ["commercial.office.workspace.gov.local"],
      "property.localAuthorityDistrict": ["Birmingham"],
      "property.region": ["West Midlands"],
      "property.boundary": {
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [-1.903955, 52.480237],
                [-1.903881, 52.480179],
                [-1.903955, 52.480237],
              ],
            ],
          ],
        },
        type: "Feature",
        properties: {
          "entry-date": "2024-05-06",
          "start-date": "2021-03-25",
          "end-date": "",
          entity: 12001049997,
          name: "",
          dataset: "title-boundary",
          typology: "geography",
          reference: "61385289",
          prefix: "title-boundary",
          "organisation-entity": "13",
        },
      },
      "proposal.site.area": 8242.37,
      "proposal.site.area.hectares": 0.8242370000000001,
      "findProperty.action": "Selected an existing address",
    },
  },
};

export const breadcrumbsWithoutUSRN = merge(cloneDeep(simpleBreadcrumbs), {
  findProperty: { data: { _address: { usrn: null } } },
});
