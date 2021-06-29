import { Store } from "pages/FlowEditor/lib/store";

import { getParams } from "./bops";

const flow: Store.flow = {
  _root: {
    edges: ["FnyZh5IrV3"],
  },
  FnyZh5IrV3: {
    data: {
      fn: "property.drawing.elevation",
      color: "#EFEFEF",
    },
    type: 140,
  },
};

test("makes file object", () => {
  const breadcrumbs: Store.breadcrumbs = {
    FnyZh5IrV3: {
      auto: false,
      data: {
        "property.drawing.elevation": [
          {
            url: "http://example.com/planning-application-location-plan.jpeg",
            filename: "planning-application-location-plan.jpeg",
          },
        ],
      },
    },
  };
  const passport: Store.passport = {
    data: {
      "property.drawing.elevation": [
        {
          url: "http://example.com/planning-application-location-plan.jpeg",
          filename: "planning-application-location-plan.jpeg",
        },
      ],
    },
  };

  const actual = getParams(breadcrumbs, flow, passport, "123").files;

  const expected = [
    {
      filename: "http://example.com/planning-application-location-plan.jpeg",
      tags: ["Existing", "Elevation"],
    },
  ];

  expect(actual).toEqual(expected);
});
