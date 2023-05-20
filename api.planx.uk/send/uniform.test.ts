import { createUniformSubmissionZip } from "./uniform";
import * as helpers from "./helpers";
import { mockLowcalSession } from "../tests/mocks/saveAndReturnMocks";

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

const mockGenerateOneAppXML = jest.fn().mockResolvedValue("<dummy:xml></dummy:xml>");
const mockGenerateCSVData = jest.fn().mockResolvedValue([{ question: "Test", responses: [{ value: "Answer" }], metadata: {}}]);
jest.mock("@opensystemslab/planx-core", () => {
  return {
    Passport: jest.fn().mockImplementation(() => ({
      getFiles: jest.fn().mockImplementation(() => []),
    })),
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      generateOneAppXML: () => mockGenerateOneAppXML(),
      getDocumentTemplateNamesForSession: jest.fn().mockResolvedValue(["X", "Y"]),
      getSessionById: () => jest.fn().mockResolvedValue(mockLowcalSession),
      generateCSVData: () => mockGenerateCSVData(),
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

  test("the csv is added to the zip", async () => {
    const payload = {
      sessionId: "1234",
    };
    await createUniformSubmissionZip(payload.sessionId);
    expect(mockAddLocalFile).toHaveBeenCalledWith("application.csv");
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("the document viewer is added to zip", async () => {
    const payload = {
      sessionId: "1234",
    };
    await createUniformSubmissionZip(payload.sessionId);
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
    };
    const expectedBuffer = Buffer.from(JSON.stringify(geojson, null, 2));
    await createUniformSubmissionZip(payload.sessionId);
    expect(mockAddFile).toHaveBeenCalledWith(
      "LocationPlanGeoJSON.geojson",
      expectedBuffer
    );
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("the location plan is added to zip", async () => {
    const payload = {
      sessionId: "1234",
    };
    await createUniformSubmissionZip(payload.sessionId);
    expect(mockAddLocalFile).toHaveBeenCalledWith("LocationPlan.htm");
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("geojson and location plan is excluded when not present", async () => {
    const payload = {
      sessionId: "1234",
    };
    await createUniformSubmissionZip(payload.sessionId);
    expect(mockAddLocalFile).not.toHaveBeenCalledWith("LocationPlan.htm");
    expect(mockAddLocalFile).not.toHaveBeenCalledWith(
      "LocationPlanGeoJSON.geojson"
    );
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  it("calls addTemplateFilesToZip", async () => {
    const spy = jest.spyOn(helpers, "addTemplateFilesToZip")
    const payload = {
      sessionId: "1234",
    };
    await createUniformSubmissionZip(payload.sessionId);
    expect(spy).toHaveBeenCalled();
  })

  it("throws an error when XML generation fails", async () => {
    mockGenerateOneAppXML.mockRejectedValue(new Error())
    const payload = {
      sessionId: "1234",
    };
    await expect(createUniformSubmissionZip(payload.sessionId)).rejects.toThrow(/Failed to generate OneApp XML/);
  });
});
