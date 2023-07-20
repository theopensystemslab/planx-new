import { mockLowcalSession } from "../tests/mocks/saveAndReturnMocks";
import { buildSubmissionExportZip } from "./exportZip";
import type { LowCalSession } from "../types";

jest.mock("fs", () => ({
  mkdtempSync: () => "tmpdir",
  existsSync: () => true,
  unlinkSync: () => undefined,
  createWriteStream: () => undefined,
  writeFileSync: () => undefined,
  rmSync: () => undefined,
}));

const mockAddFile = jest.fn();
const mockAddLocalFile = jest.fn();
jest.mock("adm-zip", () => {
  return jest.fn().mockImplementation(() => ({
    addFile: mockAddFile,
    addLocalFile: mockAddLocalFile,
    writeZip: jest.fn(),
  }));
});
const mockPipe = {
  pipe: jest.fn().mockImplementation(() => ({
    on: (event: string, cb: () => void) => {
      if (event == "finish") return cb();
    },
  })),
};
jest.mock("csv-stringify", () => {
  return {
    stringify: jest.fn().mockImplementation(() => mockPipe),
  };
});
jest.mock("string-to-stream", () => {
  return jest.fn().mockImplementation(() => mockPipe);
});

const mockGetSessionById = jest.fn().mockResolvedValue(mockLowcalSession);
const mockHasRequiredDataForTemplate = jest.fn(() => true);
jest.mock("@opensystemslab/planx-core", () => {
  return {
    Passport: jest.fn().mockImplementation(() => ({
      files: jest.fn().mockImplementation(() => []),
    })),
    hasRequiredDataForTemplate: jest.fn(() => mockHasRequiredDataForTemplate()),
    generateDocxTemplateStream: jest.fn().mockImplementation(() => mockPipe),
    generateApplicationHTMLStream: jest.fn().mockImplementation(() => mockPipe),
    generateMapHTMLStream: jest.fn().mockImplementation(() => mockPipe),
  };
});
const mockGenerateOneAppXML = jest
  .fn()
  .mockResolvedValue({ trim: () => "<dummy:xml></dummy:xml>" });

jest.mock("../client", () => {
  return {
    $admin: {
      generateOneAppXML: () => mockGenerateOneAppXML(),
      getDocumentTemplateNamesForSession: jest
        .fn()
        .mockResolvedValue(["X", "Y"]),
      session: {
        find: () => mockGetSessionById(),
      },
      export: {
        csvData: jest.fn().mockResolvedValue({
          responses: [
            {
              question: "Test",
              responses: [{ value: "Answer" }],
              metadata: {},
            },
          ],
          redactedResponses: [],
        }),
      },
    },
  };
});

describe("buildSubmissionExportZip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("the csv is added to the zip", async () => {
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddLocalFile).toHaveBeenCalledWith(
      expect.stringMatching(/application.csv$/),
    );
  });

  test("the document viewer is added to zip", async () => {
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddLocalFile).toHaveBeenCalledWith(
      expect.stringMatching(/Overview.htm$/),
    );
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
    const expectedBuffer = Buffer.from(JSON.stringify(geojson, null, 2));
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddFile).toHaveBeenCalledWith(
      expect.stringMatching(/LocationPlanGeoJSON.geojson$/),
      expectedBuffer,
    );
  });

  test("the location plan is added to zip", async () => {
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddLocalFile).toHaveBeenCalledWith(
      expect.stringMatching(/LocationPlan.htm$/),
    );
  });

  test("geojson and location plan is excluded when not present", async () => {
    // set-up mock session passport excluding "property.boundary.site"
    const lowcalSessionWithoutBoundary: Partial<LowCalSession> = {
      ...mockLowcalSession,
      id: "1234",
      data: {
        ...mockLowcalSession.data,
        id: "1234",
        passport: {
          data: {
            ...mockLowcalSession.data!.passport.data,
            "property.boundary.site": undefined,
          },
        },
      },
    };
    mockGetSessionById.mockResolvedValueOnce(lowcalSessionWithoutBoundary);

    await buildSubmissionExportZip({ sessionId: "1234" });

    expect(mockAddLocalFile).not.toHaveBeenCalledWith(
      expect.stringMatching(/LocationPlan.htm$/),
    );
    expect(mockAddLocalFile).not.toHaveBeenCalledWith(
      expect.stringMatching(/LocationPlanGeoJSON.geojson$/),
    );
  });

  test("a document template is added when the template is supported", async () => {
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddLocalFile).toHaveBeenCalledWith(
      expect.stringMatching(/X\.doc$/),
    );
    expect(mockAddLocalFile).toHaveBeenCalledWith(
      expect.stringMatching(/Y\.doc$/),
    );
  });

  test("a document template is not added when the template is not supported", async () => {
    mockHasRequiredDataForTemplate
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddLocalFile).not.toHaveBeenCalledWith(
      expect.stringMatching(/X\.doc$/),
    );
    expect(mockAddLocalFile).toHaveBeenCalledWith(
      expect.stringMatching(/Y\.doc$/),
    );
  });

  describe("includeOneAppXML", () => {
    test("the OneApp XML document is added", async () => {
      await buildSubmissionExportZip({
        sessionId: "1234",
        includeOneAppXML: true,
      });
      expect(mockAddLocalFile).toHaveBeenCalledWith(
        expect.stringMatching(/proposal\.xml$/),
      );
    });

    it("throws an error when XML generation fails", async () => {
      mockGenerateOneAppXML.mockRejectedValueOnce(
        new Error("intentional test error"),
      );
      await expect(
        buildSubmissionExportZip({
          sessionId: "1234",
          includeOneAppXML: true,
        }),
      ).rejects.toThrow(/Failed to generate OneApp XML/);
    });
  });
});
