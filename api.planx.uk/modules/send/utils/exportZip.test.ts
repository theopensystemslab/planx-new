import { mockLowcalSession } from "../../../tests/mocks/saveAndReturnMocks.js";
import { buildSubmissionExportZip } from "./exportZip.js";
import type { LowCalSession } from "../../../types.js";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks.js";

vi.mock("fs", () => ({
  default: {
    mkdtempSync: () => "tmpdir",
    existsSync: () => true,
    unlinkSync: () => undefined,
    createWriteStream: () => undefined,
    rmSync: () => undefined,
  },
}));

const mockAddFile = vi.fn();
const mockAddLocalFile = vi.fn();
vi.mock("adm-zip", () => ({
  default: vi.fn().mockImplementation(() => ({
    addFile: mockAddFile,
    addLocalFile: mockAddLocalFile,
    writeZip: vi.fn(),
  })),
}));
const mockPipe = {
  pipe: vi.fn().mockImplementation(() => ({
    on: (event: string, cb: () => void) => {
      if (event == "finish") return cb();
    },
  })),
};
vi.mock("csv-stringify", () => {
  return {
    stringify: vi.fn().mockImplementation(() => mockPipe),
  };
});
vi.mock("string-to-stream", () => ({
  default: vi.fn().mockImplementation(() => mockPipe),
}));

const mockGetSessionById = vi.fn().mockResolvedValue(mockLowcalSession);
const mockHasRequiredDataForTemplate = vi.fn(() => true);
vi.mock("@opensystemslab/planx-core", () => {
  return {
    Passport: vi.fn().mockImplementation(() => ({
      files: vi.fn().mockImplementation(() => []),
    })),
    hasRequiredDataForTemplate: vi.fn(() => mockHasRequiredDataForTemplate()),
    generateDocxTemplateStream: vi.fn().mockImplementation(() => mockPipe),
    generateApplicationHTML: vi
      .fn()
      .mockImplementation(() => "<p>application</p>"),
    generateMapHTML: vi.fn().mockImplementation(() => "<p>map</p>"),
  };
});
const mockGenerateOneAppXML = vi
  .fn()
  .mockResolvedValue({ trim: () => "<dummy:xml></dummy:xml>" });
const mockGenerateDigitalPlanningDataPayload = vi
  .fn()
  .mockResolvedValue(expectedPlanningPermissionPayload);

vi.mock("../../../client", () => {
  return {
    $api: {
      getDocumentTemplateNamesForSession: vi.fn().mockResolvedValue(["X", "Y"]),
      session: {
        find: () => mockGetSessionById(),
      },
      export: {
        csvData: vi.fn().mockResolvedValue([
          {
            question: "Test",
            responses: [{ value: "Answer" }],
            metadata: {},
          },
        ]),
        csvDataRedacted: vi.fn().mockResolvedValue([]),
        oneAppPayload: () => mockGenerateOneAppXML(),
        digitalPlanningDataPayload: () =>
          mockGenerateDigitalPlanningDataPayload(),
      },
    },
  };
});

describe("buildSubmissionExportZip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("the csv is added to the zip", async () => {
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddLocalFile).toHaveBeenCalledWith(
      expect.stringMatching(/application.csv$/),
    );
  });

  test("the document viewer is added to zip", async () => {
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddFile).toHaveBeenCalledWith("Overview.htm", expect.anything());
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
      properties: {
        planx_user_action: "Amended the title boundary",
      },
    };
    const expectedBuffer = Buffer.from(JSON.stringify(geojson, null, 2));
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddFile).toHaveBeenCalledWith(
      "LocationPlanGeoJSON.geojson",
      expectedBuffer,
    );
  });

  test("the location plan is added to zip", async () => {
    await buildSubmissionExportZip({ sessionId: "1234" });
    expect(mockAddFile).toHaveBeenCalledWith(
      "LocationPlan.htm",
      expect.anything(),
    );
  });

  test("geojson and location plan is excluded when not present", async () => {
    // set-up mock session passport excluding "proposal.site"
    const lowcalSessionWithoutBoundary: Partial<LowCalSession> = {
      ...mockLowcalSession,
      id: "1234",
      data: {
        ...mockLowcalSession.data,
        id: "1234",
        passport: {
          data: {
            ...mockLowcalSession.data!.passport.data,
            "proposal.site": undefined,
          },
        },
      },
    };
    mockGetSessionById.mockResolvedValueOnce(lowcalSessionWithoutBoundary);

    await buildSubmissionExportZip({ sessionId: "1234" });

    expect(mockAddFile).not.toHaveBeenCalledWith(
      "LocationPlan.htm",
      expect.anything(),
    );
    expect(mockAddFile).not.toHaveBeenCalledWith(
      "LocationPlanGeoJSON.geojson",
      expect.anything(),
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

  describe("includeDigitalPlanningJSON", () => {
    test("ODP schema json is added to the zip", async () => {
      await buildSubmissionExportZip({
        sessionId: "1234",
        includeDigitalPlanningJSON: true,
      });
      expect(mockAddFile).toHaveBeenCalledWith(
        "application.json",
        expect.anything(),
      );
    });

    test("ODP schema json is excluded if no query param", async () => {
      await buildSubmissionExportZip({ sessionId: "1234" });
      expect(mockAddFile).not.toHaveBeenCalledWith(
        "application.json",
        expect.anything(),
      );
    });

    test("ODP schema json is included, but not validated, if unsupported application type", async () => {
      // set-up mock session passport overwriting "application.type"
      const lowcalSessionUnsupportedAppType: Partial<LowCalSession> = {
        ...mockLowcalSession,
        id: "1234",
        data: {
          ...mockLowcalSession.data,
          id: "1234",
          passport: {
            data: {
              ...mockLowcalSession.data!.passport.data,
              "application.type": ["reportAPlanningBreach"],
            },
          },
        },
      };
      mockGetSessionById.mockResolvedValueOnce(lowcalSessionUnsupportedAppType);

      await buildSubmissionExportZip({
        sessionId: "1234",
        includeDigitalPlanningJSON: true,
      });

      expect(mockAddFile).toHaveBeenCalledWith(
        "application.json",
        expect.anything(),
      );
    });

    test("ODP schema json is included, but not validated, if no application type", async () => {
      // set-up mock session passport overwriting "application.type"
      const lowcalSessionUnsupportedAppType: Partial<LowCalSession> = {
        ...mockLowcalSession,
        id: "1234",
        data: {
          ...mockLowcalSession.data,
          id: "1234",
          passport: {
            data: {
              ...mockLowcalSession.data!.passport.data,
              "application.type": undefined,
            },
          },
        },
      };
      mockGetSessionById.mockResolvedValueOnce(lowcalSessionUnsupportedAppType);

      await buildSubmissionExportZip({
        sessionId: "1234",
        includeDigitalPlanningJSON: true,
      });

      expect(mockAddFile).toHaveBeenCalledWith(
        "application.json",
        expect.anything(),
      );
    });

    it("throws an error when ODP schema generation fails", async () => {
      mockGenerateDigitalPlanningDataPayload.mockRejectedValueOnce(
        new Error("validation test error"),
      );
      await expect(
        buildSubmissionExportZip({
          sessionId: "1234",
          includeDigitalPlanningJSON: true,
        }),
      ).rejects.toThrow(/Failed to generate ODP Schema JSON/);
    });
  });

  describe("onlyDigitalPlanningJSON", () => {
    test("ODP schema json is added to the zip", async () => {
      await buildSubmissionExportZip({
        sessionId: "1234",
        onlyDigitalPlanningJSON: true,
      });
      expect(mockAddFile).toHaveBeenCalledWith(
        "application.json",
        expect.anything(),
      );
      // ensure we haven't tried to build other files, even if we haven't added them
      expect(mockGenerateOneAppXML).not.toHaveBeenCalled();
    });

    test("the zip contains exactly one file", async () => {
      await buildSubmissionExportZip({
        sessionId: "1234",
        onlyDigitalPlanningJSON: true,
      });
      expect(mockAddFile).toHaveBeenCalledTimes(1);
    });

    it("throws an error when ODP schema generation fails", async () => {
      mockGenerateDigitalPlanningDataPayload.mockRejectedValueOnce(
        new Error("validation test error"),
      );
      await expect(
        buildSubmissionExportZip({
          sessionId: "1234",
          onlyDigitalPlanningJSON: true,
        }),
      ).rejects.toThrow(/Failed to generate ODP Schema JSON/);
    });
  });
});
