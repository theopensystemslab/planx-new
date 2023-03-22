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

const mockHasRequiredDataForTemplate = jest.fn(() => true);
jest.mock("@opensystemslab/planx-document-templates", () => {
  return {
    hasRequiredDataForTemplate: jest.fn(() => mockHasRequiredDataForTemplate()),
    generateDocxTemplateStream: jest.fn().mockImplementation(() => mockPipe),
    generateHTMLOverviewStream: jest.fn().mockImplementation(() => mockPipe),
    generateHTMLMapStream: jest.fn().mockImplementation(() => mockPipe),
  };
});

const mockGenerateOneAppXML = jest.fn().mockResolvedValue("<dummy:xml></dummy:xml>")
jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      generateOneAppXML: () => mockGenerateOneAppXML(),
    }))
  }
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
    mockHasRequiredDataForTemplate.mockClear();
  });

  test("the document viewer is added to zip", async () => {
    const payload = {
      sessionId: "1234",
      passport: { data: {} },
      csv: [],
      files: [],
      geojson: null,
      templateNames: [],
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
    };
    await createUniformSubmissionZip(payload);
    expect(mockAddLocalFile).not.toHaveBeenCalledWith("LocationPlan.htm");
    expect(mockAddLocalFile).not.toHaveBeenCalledWith(
      "LocationPlanGeoJSON.geojson"
    );
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("a document template is added when the template is supported", async () => {
    const payload = {
      sessionId: "1234",
      passport: { data: {} },
      csv: [],
      files: [],
      templateNames: ["X", "Y"],
    };
    await createUniformSubmissionZip(payload);
    expect(mockAddLocalFile).toHaveBeenCalledWith("X.doc");
    expect(mockAddLocalFile).toHaveBeenCalledWith("Y.doc");
  });

  test("a document template is not added when the template is not supported", async () => {
    mockHasRequiredDataForTemplate
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const payload = {
      sessionId: "1234",
      passport: { data: {} },
      csv: [],
      files: [],
      templateNames: ["X", "Y"],
    };
    await createUniformSubmissionZip(payload);
    expect(mockAddLocalFile).not.toHaveBeenCalledWith("X.doc");
    expect(mockAddLocalFile).toHaveBeenCalledWith("Y.doc");
  });

  it("throws an error when XML generation fails", async () => {
    mockGenerateOneAppXML.mockRejectedValue(new Error())
    const payload = {
      sessionId: "1234",
      passport: { data: {} },
      csv: [],
      files: [],
      templateNames: ["X", "Y"],
    };
    await expect(createUniformSubmissionZip(payload)).rejects.toThrow(/Failed to generate OneApp XML/);
  });
});
