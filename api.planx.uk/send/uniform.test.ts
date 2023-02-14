import { queryMock } from "../tests/graphqlQueryMock";
import { createUniformSubmissionZip } from "./uniform";

jest.mock("fs");
const mockAddFile = jest.fn();
const mockAddLocalFile = jest.fn();
const mockWriteZip = jest.fn();
jest.mock("adm-zip", () => {
  return jest.fn().mockImplementation(() => ({
    addFile: mockAddFile,
    addLocalFile: mockAddLocalFile,
    writeZip: mockWriteZip,
  }));
});
const mockPipe = {
  pipe: jest.fn().mockImplementation(() => ({
    on: (event: string, cb: () => void) => {
      if (event == "finish") return cb();
    },
  })),
};
jest.mock("@opensystemslab/planx-document-templates", () => {
  return {
    hasRequiredDataForTemplate: jest.fn().mockImplementation(() => true),
    generateDocxTemplateStream: jest.fn().mockImplementation(() => mockPipe),
    generateHTMLOverviewStream: jest.fn().mockImplementation(() => mockPipe),
    generateHTMLMapStream: jest.fn().mockImplementation(() => mockPipe),
  };
});
jest.mock("csv-stringify", () => {
  return {
    stringify: jest.fn().mockImplementation(() => mockPipe),
  };
});
jest.mock("string-to-stream", () => {
  return jest.fn().mockImplementation(() => mockPipe);
});

describe("createUniformSubmissionZip", () => {
  beforeEach(() => {
    mockAddFile.mockClear();
    mockAddLocalFile.mockClear();
    mockWriteZip.mockClear();
  });

  test("the document viewer is added to zip", async () => {
    const payload = {
      sessionId: "1234",
      passport: { data: {} },
      csv: [],
      files: [],
      geojson: null,
      templateNames: [],
      xml: "",
    };
    await createUniformSubmissionZip(payload);
    expect(mockAddLocalFile).toHaveBeenCalledWith("Overview.htm");
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("boundary GeoJSON is added to zip", async () => {
    const geojson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.07626448954420499, 51.48571252157308],
            [-0.0762916416717913, 51.48561932090584],
            [-0.07614058275089933, 51.485617225458554],
            [-0.07611118911905082, 51.4857099488319],
            [-0.07626448954420499, 51.48571252157308],
          ],
        ],
      },
      properties: null,
    };
    const payload = {
      sessionId: "1234",
      passport: {
        data: {
          "property.boundary.site": geojson,
        },
      },
      csv: [],
      files: [],
      templateNames: [],
      xml: "",
    };
    const expectedBuffer = Buffer.from(JSON.stringify(geojson, null, 2));
    await createUniformSubmissionZip(payload);
    expect(mockAddFile).toHaveBeenCalledWith(
      "LocationPlanGeoJSON.geojson",
      expectedBuffer
    );
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("the location plan is added to zip", async () => {
    const geojson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.07626448954420499, 51.48571252157308],
            [-0.0762916416717913, 51.48561932090584],
            [-0.07614058275089933, 51.485617225458554],
            [-0.07611118911905082, 51.4857099488319],
            [-0.07626448954420499, 51.48571252157308],
          ],
        ],
      },
      properties: null,
    };
    const payload = {
      sessionId: "1234",
      passport: {
        data: {
          "property.boundary.site": geojson,
        },
      },
      csv: [],
      files: [],
      templateNames: [],
      xml: "",
    };
    await createUniformSubmissionZip(payload);
    expect(mockAddLocalFile).toHaveBeenCalledWith("LocationPlan.htm");
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("geojson and location plan is excluded when not present", async () => {
    const payload = {
      sessionId: "1234",
      passport: { data: {} },
      csv: [],
      files: [],
      templateNames: [],
      xml: "",
    };
    await createUniformSubmissionZip(payload);
    expect(mockAddLocalFile).not.toHaveBeenCalledWith("LocationPlan.htm");
    expect(mockAddLocalFile).not.toHaveBeenCalledWith("LocationPlanGeoJSON.geojson");
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test.todo("a template generated document is added to zip");
});
