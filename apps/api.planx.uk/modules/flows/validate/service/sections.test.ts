import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { validateSections } from "./sections.js";

test("Fails when a nested external portal has sections", () => {
  const result = validateSections(invalidFlattenedFlow);

  expect(result.status).toEqual("Fail");
  expect(result.message).toEqual(
    "Found Sections in one or more External Portals, but Sections are only allowed in main flow",
  );
});

test("Passes when sections are used on the root or within folders only", () => {
  const result = validateSections(validFlattenedFlow);

  expect(result.status).toEqual("Pass");
  expect(result.message).toEqual("Your flow has valid Sections");
});

const invalidFlattenedFlow: FlowGraph = {
  _root: {
    edges: ["FirstSection", "FolderWithSection", "ExternalPortalWithSection"],
  },
  SectionInFolder: {
    data: {
      title: "Section in folder",
    },
    type: 360,
  },
  FolderWithSection: {
    data: {
      text: "Folder",
    },
    type: 300,
    edges: ["SectionInFolder"],
  },
  FirstSection: {
    data: {
      title: "One",
    },
    type: 360,
  },
  ExternalPortalWithSection: {
    type: 300,
    edges: ["583b1ead-ac60-4e14-bae2-f6274196341c"],
    data: {
      flattenedFromExternalPortal: true,
    },
  },
  "583b1ead-ac60-4e14-bae2-f6274196341c": {
    edges: ["SectionInExternalPortal"],
    type: 300,
    data: {
      text: "testing/test-mocks",
      flattenedFromExternalPortal: true,
      publishedFlowId: 22,
      publishedAt: "2025-07-08T13:59:45.066004+00:00",
      publishedBy: 20,
      summary: "This is a test",
    },
  },
  SectionInExternalPortal: {
    data: {
      title: "Section",
    },
    type: 360,
  },
};

const validFlattenedFlow: FlowGraph = {
  _root: {
    edges: [
      "FirstSection",
      "FolderWithSection",
      "ExternalPortalWithoutSection",
    ],
  },
  SectionInFolder: {
    data: {
      title: "Section in folder",
    },
    type: 360,
  },
  FolderWithSection: {
    data: {
      text: "Folder",
    },
    type: 300,
    edges: ["SectionInFolder"],
  },
  FirstSection: {
    data: {
      title: "One",
    },
    type: 360,
  },
  ExternalPortalWithoutSection: {
    type: 300,
    edges: ["583b1ead-ac60-4e14-bae2-f6274196341c"],
    data: {
      flattenedFromExternalPortal: true,
    },
  },
  "583b1ead-ac60-4e14-bae2-f6274196341c": {
    edges: [],
    type: 300,
    data: {
      text: "testing/test-mocks",
      flattenedFromExternalPortal: true,
      publishedFlowId: 22,
      publishedAt: "2025-07-08T13:59:45.066004+00:00",
      publishedBy: 20,
      summary: "This is a test",
    },
  },
};
