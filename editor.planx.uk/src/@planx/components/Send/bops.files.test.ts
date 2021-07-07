import { Store } from "pages/FlowEditor/lib/store";

import { PASSPORT_UPLOAD_KEY } from "../DrawBoundary/model";
import { extractTagsFromPassportKey, getParams } from "./bops";

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
      tags: ["Existing", "Elevation", "Plan"],
    },
  ];

  expect(actual).toEqual(expected);
});

describe("It extracts tags for", () => {
  const data = {
    "No passport key": {
      key: "",
      tags: [],
    },
    "Unmatchable passport key": {
      key: "foo",
      tags: [],
    },
    "Existing floor plan": {
      key: "property.drawing.plan",
      tags: ["Existing", "Floor", "Plan"],
    },
    "Proposed floor plan": {
      key: "proposal.drawing.plan",
      tags: ["Proposed", "Floor", "Plan"],
    },
    "Existing site plan": {
      key: "property.drawing.sitePlan",
      tags: ["Existing", "Site", "Plan"],
    },
    "Proposed site plan": {
      key: "proposal.drawing.sitePlan",
      tags: ["Proposed", "Site", "Plan"],
    },
    "Existing elevations": {
      key: "property.drawing.elevation",
      tags: ["Existing", "Elevation", "Plan"],
    },
    "Proposed elevations": {
      key: "proposal.drawing.elevation",
      tags: ["Proposed", "Elevation", "Plan"],
    },
    "Existing sections": {
      key: "property.drawing.section",
      tags: ["Existing", "Section", "Plan"],
    },
    "Proposed sections": {
      key: "proposal.drawing.section",
      tags: ["Proposed", "Section", "Plan"],
    },
    "Existing roof plan": {
      key: "property.drawing.roofPlan",
      tags: ["Existing", "Roof", "Plan"],
    },
    "Proposed roof plan": {
      key: "proposal.drawing.roofPlan",
      tags: ["Proposed", "Roof", "Plan"],
    },
    // The following require more tags to be made available by BOPS
    Photographs: { key: "proposal.photograph.existing", tags: ["Proposed"] },
    Visualisations: { key: "proposal.visualisation", tags: ["Proposed"] },
    "Additional drawing": { key: "proposal.drawing.other", tags: ["Proposed"] },
    "Additional document": {
      key: "proposal.document.other",
      tags: ["Proposed"],
    },
    "Site boundary PDF": {
      key: PASSPORT_UPLOAD_KEY,
      tags: ["Proposed", "Plan"],
    },
  };

  Object.entries(data).forEach(([example, { key, tags }]) => {
    test(example, () => {
      expect(extractTagsFromPassportKey(key)).toEqual(tags);
    });
  });
});
