import { Store } from "pages/FlowEditor/lib/store";

import { TYPES } from "../types";
import { getParams, makePayload } from "./bops";

test("makes a more advanced payload", () => {
  const flow: Store.flow = {
    _root: {
      edges: [
        "9MOwkWbaQk",
        "d8up0QZ5c7",
        "UxwdVmsGmn",
        "Lt1vhc91Ae",
        "8kKGIvNzEN",
      ],
    },
    d8up0QZ5c7: {
      type: TYPES.Statement,
      data: {
        text: "is the property in this specific region?",
      },
      edges: ["gHp8xtlx36", "xy9EO8mA13"],
    },
    gHp8xtlx36: {
      type: TYPES.Response,
      data: {
        text: "yes",
      },
    },
    xy9EO8mA13: {
      type: TYPES.Response,
      data: {
        text: "no",
      },
    },
    "9MOwkWbaQk": {
      type: TYPES.Checklist,
      data: {
        allRequired: false,
        text: "what are you planning to do?",
      },
      edges: ["2p2ZJhTW63", "0mri6OiU0M", "a4ZWUug077"],
    },
    "2p2ZJhTW63": {
      data: {
        text: "demolish",
      },
      type: TYPES.Response,
    },
    "0mri6OiU0M": {
      data: {
        text: "merge",
      },
      type: TYPES.Response,
    },
    a4ZWUug077: {
      data: {
        text: "build new",
      },
      type: TYPES.Response,
    },
    UxwdVmsGmn: {
      type: TYPES.Statement,
      data: {
        text:
          "will the new build's footprint occupy more than 50% available land?",
        policyRef: "<p><code>Southwark SPD figure 123.31</code></p>\n",
      },
      edges: ["oULA5kx0NK", "BVWlOioEYE"],
    },
    oULA5kx0NK: {
      type: TYPES.Response,
      data: {
        text: "yes",
      },
    },
    BVWlOioEYE: {
      type: TYPES.Response,
      data: {
        text: "no",
      },
    },
    Lt1vhc91Ae: {
      type: TYPES.Statement,
      data: {
        text: "when was the original property built?",
      },
      edges: ["bc4qu832vd", "xBXS2yRjw7"],
    },
    bc4qu832vd: {
      type: TYPES.Response,
      data: {
        text: "before 2000",
      },
    },
    xBXS2yRjw7: {
      type: TYPES.Response,
      data: {
        text: "don't know",
        flag: "MISSING_INFO",
      },
    },
    "8kKGIvNzEN": {
      type: TYPES.TextInput,
      data: {
        title: "please describe the project",
      },
    },
  };

  const breadcrumbs: Store.breadcrumbs = {
    "9MOwkWbaQk": {
      answers: ["2p2ZJhTW63", "a4ZWUug077"],
      auto: false,
    },
    d8up0QZ5c7: {
      answers: ["xy9EO8mA13"],
      auto: true,
    },
    UxwdVmsGmn: {
      answers: ["oULA5kx0NK"],
      auto: false,
    },
    Lt1vhc91Ae: {
      answers: ["xBXS2yRjw7"],
      auto: false,
    },
    "8kKGIvNzEN": {
      answers: ["extension demolition followed by a rebuild"],
      auto: false,
    },
  };

  expect(makePayload(flow, breadcrumbs)).toEqual([
    {
      question: "what are you planning to do?",
      responses: [
        {
          value: "demolish",
        },
        {
          value: "build new",
        },
      ],
    },
    {
      question: "is the property in this specific region?",
      metadata: {
        auto_answered: true,
      },
      responses: [
        {
          value: "no",
        },
      ],
    },
    {
      question:
        "will the new build's footprint occupy more than 50% available land?",
      metadata: {
        policy_refs: [
          // TODO: split policy refs into multiple text?/url? objects
          { text: "Southwark SPD figure 123.31" },
        ],
      },
      responses: [
        {
          value: "yes",
        },
      ],
    },
    {
      question: "when was the original property built?",
      responses: [
        {
          value: "don't know",
          metadata: {
            flags: ["Planning permission / Missing information"],
          },
        },
      ],
    },
    {
      question: "please describe the project",
      responses: [
        {
          value: "extension demolition followed by a rebuild",
        },
      ],
    },
  ]);
});

test("handles geo information", () => {
  const flow: Store.flow = {
    _root: {
      edges: ["wLOgE7wk0g", "RL7mZR0Ukm"],
    },
    RL7mZR0Ukm: {
      data: {
        dataFieldArea: "specialarea",
        dataFieldBoundary: "property.boundary.site",
      },
      type: TYPES.DrawBoundary,
    },
    wLOgE7wk0g: {
      type: TYPES.FindProperty,
    },
  };

  const passport: Store.passport = {
    data: {
      _address: {
        __typename: "addresses",
        uprn: "200003453481",
        town: "LONDON",
        y: 178075.15617517993,
        x: 533677.7864906556,
        street: "COBOURG ROAD",
        sao: "",
        postcode: "SE5 0HU",
        pao: "49",
        organisation: "",
        blpu_code: "RD",
        latitude: "51.4858363",
        longitude: "-0.0761246",
        full_address: "49 COBOURG ROAD, LONDON",
        title: "49 COBOURG ROAD, LONDON",
      },
      "property.constraints.planning": [
        "listed",
        "designated.conservationArea",
      ],
      "property.boundary.site": {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-0.0762381016591329, 51.48589318633188],
              [-0.07605044913233461, 51.485675957205665],
              [-0.07591909236368012, 51.48586143752448],
              [-0.0762381016591329, 51.48589318633188],
            ],
          ],
        },
      },
      specialarea: 244.39,
    },
  };

  const breadcrumbs: Store.breadcrumbs = {
    wLOgE7wk0g: {
      auto: false,
      data: {
        _address: {
          __typename: "addresses",
          uprn: "200003453481",
          town: "LONDON",
          y: 178075.15617517993,
          x: 533677.7864906556,
          street: "COBOURG ROAD",
          sao: "",
          postcode: "SE5 0HU",
          pao: "49",
          organisation: "",
          blpu_code: "RD",
          latitude: "51.4858363",
          longitude: "-0.0761246",
          full_address: "49 COBOURG ROAD, LONDON",
          title: "49 COBOURG ROAD, LONDON",
        },
        "property.constraints.planning": [
          "listed",
          "designated.conservationArea",
        ],
      },
    },
    RL7mZR0Ukm: {
      auto: false,
      data: {
        "property.boundary.site": {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-0.0762381016591329, 51.48589318633188],
                [-0.07605044913233461, 51.485675957205665],
                [-0.07591909236368012, 51.48586143752448],
                [-0.0762381016591329, 51.48589318633188],
              ],
            ],
          },
        },
        specialarea: 244.39,
      },
    },
  };

  expect(getParams(breadcrumbs, flow, passport)).toEqual({
    application_type: "lawfulness_certificate",
    constraints: { "designated.conservationArea": true, listed: true },
    files: [],
    payment_reference: "JG669323",
    proposal_details: [],
    site: {
      address_1: "49 COBOURG ROAD",
      postcode: "SE5 0HU",
      town: "LONDON",
      uprn: "200003453481",
    },
    work_status: "proposed",
    boundary_geojson: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.0762381016591329, 51.48589318633188],
            [-0.07605044913233461, 51.485675957205665],
            [-0.07591909236368012, 51.48586143752448],
            [-0.0762381016591329, 51.48589318633188],
          ],
        ],
      },
    },
  });
});
