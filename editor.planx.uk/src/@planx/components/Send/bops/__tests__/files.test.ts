import { Store } from "pages/FlowEditor/lib/store";

import { PASSPORT_UPLOAD_KEY } from "../../../DrawBoundary/model";
import { extractTagsFromPassportKey, getBOPSParams } from "../../bops";
import type { FileTag } from "../../model";

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
            url: "http://localhost:7002/file/private/y2uubi9x/placeholder.png",
            filename: "placeholder.png",
            cachedSlot: {
              file: {
                path: "placeholder.png",
                type: "image/png",
                size: 6146,
              },
              status: "success",
              progress: 1,
              id: "oPd5GUV_T-bWZWJb0wGs8",
              url: "http://localhost:7002/file/private/y2uubi9x/placeholder.png",
            },
          },
        ],
      },
    },
  };
  const passport: Store.passport = {
    data: {
      "property.drawing.elevation": [
        {
          url: "http://localhost:7002/file/private/y2uubi9x/placeholder.png",
          filename: "placeholder.png",
          cachedSlot: {
            file: {
              path: "placeholder.png",
              type: "image/png",
              size: 6146,
            },
            status: "success",
            progress: 1,
            id: "oPd5GUV_T-bWZWJb0wGs8",
            url: "http://localhost:7002/file/private/y2uubi9x/placeholder.png",
          },
        },
      ],
    },
  };

  const actual = getBOPSParams({
    breadcrumbs,
    flow,
    passport,
    sessionId: "123",
    flowName: "Apply for a lawful development certificate",
  }).files;

  const expected = [
    expect.objectContaining({
      filename: "http://localhost:7002/file/private/y2uubi9x/placeholder.png",
    }),
  ];

  expect(actual).toEqual(expected);
});

interface TestTag {
  key: string;
  tags: Array<FileTag>;
}

// Google Sheet listing tags: https://bit.ly/3yIscgc
describe("It extracts tags for", () => {
  const data: Record<string, TestTag> = {
    "No passport key": {
      key: "",
      tags: [],
    },
    "Unmatchable passport key": {
      key: "foo",
      tags: [],
    },
    "Location plan": {
      key:
        PASSPORT_UPLOAD_KEY === "locationPlan"
          ? PASSPORT_UPLOAD_KEY
          : "key changed unexpectedly!",
      tags: [/*"Proposed", "Drawing",*/ "Site", "Plan"],
    },
    "Existing site plan": {
      key: "property.drawing.sitePlan",
      tags: ["Existing", /*"Drawing", "Site",*/ "Plan"], // "Site" is reserved for red-line drawings ONLY!
    },
    "Proposed site plan": {
      key: "proposal.drawing.sitePlan",
      tags: ["Proposed", /*"Drawing", "Site",*/ "Plan"],
    },
    "Existing floor plan": {
      key: "property.drawing.floorPlan",
      tags: ["Existing", /*"Drawing",*/ "Floor", "Plan"],
    },
    "Proposed floor plan": {
      key: "proposal.drawing.floorPlan",
      tags: ["Proposed", /*"Drawing",*/ "Floor", "Plan"],
    },
    "Existing roof plan": {
      key: "property.drawing.roofPlan",
      tags: ["Existing", /*"Drawing",*/ "Roof", "Plan"],
    },
    "Proposed roof plan": {
      key: "proposal.drawing.roofPlan",
      tags: ["Proposed", /*"Drawing",*/ "Roof", "Plan"],
    },
    "Existing elevations": {
      key: "property.drawing.elevation",
      tags: ["Existing", /*"Drawing",*/ "Elevation"],
    },
    "Proposed elevations": {
      key: "proposal.drawing.elevation",
      tags: ["Proposed", /*"Drawing",*/ "Elevation"],
    },
    "Existing sections": {
      key: "property.drawing.section",
      tags: ["Existing", /*"Drawing",*/ "Section"],
    },
    "Proposed sections": {
      key: "proposal.drawing.section",
      tags: ["Proposed", /*"Drawing",*/ "Section"],
    },
    "Existing Photographs": {
      key: "property.photograph",
      tags: ["Existing", "Photograph"],
    },
    Visualisation: {
      key: "proposal.visualisation",
      tags: ["Proposed" /*"Visualisation"*/],
    },
    "Proposed outbuilding roof plan": {
      key: "proposal.drawing.roofPlan.outbuilding",
      tags: ["Proposed", /*"Drawing",*/ "Roof", "Plan"],
    },
    "Proposed extension roof plan": {
      key: "proposal.drawing.roofPlan.extension",
      tags: ["Proposed", /*"Drawing",*/ "Roof", "Plan"],
    },
    "Proposed porch roof plan": {
      key: "proposal.drawing.roofPlan.porch",
      tags: ["Proposed", /*"Drawing",*/ "Roof", "Plan"],
    },
    "Existing use plan": {
      key: "property.drawing.usePlan",
      tags: ["Existing", /*"Drawing", "Use",*/ "Plan"],
    },
    "Proposed use plan": {
      key: "proposal.drawing.usePlan",
      tags: ["Proposed", /*"Drawing", "Use",*/ "Plan"],
    },
    "Existing unit plans": {
      key: "property.drawing.unitPlan",
      tags: ["Existing", /*"Drawing", "Unit",*/ "Plan"],
    },
    "Proposed unit plans": {
      key: "proposal.drawing.unitPlan",
      tags: ["Proposed", /*"Drawing", "Unit",*/ "Plan"],
    },
    "Additional drawings": {
      key: "proposal.drawing.other",
      tags: ["Proposed", /*"Drawing",*/ "Other"],
    },
    "Additional documents": {
      key: "proposal.document.other",
      tags: ["Proposed", /*"Document",*/ "Other"],
    },
    // Evidence of immunity
    Photographs: {
      key: "proposal.photograph",
      tags: ["Proposed", "Photograph"],
    },
    "Utility bill": {
      key: "proposal.document.utility.bill",
      tags: ["Proposed" /*"Document",*/, "Utility Bill"],
    },
    "Building control certificate": {
      key: "proposal.document.buildingControl.certificate",
      tags: ["Proposed" /*"Document",*/, "Building Control Certificate"],
    },
    "Construction invoice": {
      key: "proposal.document.construction.invoice",
      tags: ["Proposed" /*"Document",*/, "Construction Invoice"],
    },
    "Council tax documents": {
      key: "proposal.document.councilTaxBill",
      tags: ["Proposed" /*"Document",*/, "Council Tax Document"],
    },
    "Tenancy agreements": {
      key: "proposal.document.tenancyAgreement",
      tags: ["Proposed" /*"Document",*/, "Tenancy Agreement"],
    },
    "Tenancy invoices": {
      key: "proposal.document.tenancyInvoice",
      tags: ["Proposed" /*"Document"*,*/, "Tenancy Invoice"],
    },
    "Bank statements": {
      key: "proposal.document.bankStatement",
      tags: ["Proposed" /*"Document",*/, "Bank Statement"],
    },
    "Statutory declaration": {
      key: "proposal.document.declaration",
      tags: ["Proposed" /*"Document",*/, "Statutory Declaration"],
    },
  };

  Object.entries(data).forEach(([example, { key, tags }]) => {
    test(`${example}`, () => {
      expect(extractTagsFromPassportKey(key)).toStrictEqual(tags);
    });
  });
});
