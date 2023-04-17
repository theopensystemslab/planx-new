import AdmZip from "adm-zip";
import { addTemplateFilesToZip } from "./helpers";

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

jest.mock("@opensystemslab/planx-core", () => {
  return {
    Passport: jest.fn(),
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      getDocumentTemplateNamesForSession: jest.fn().mockResolvedValue(["X", "Y"]),
    }))
  }
});

describe("addTemplateFilesToZip()", () => {
  beforeEach(() => {
    mockAddFile.mockClear();
    mockAddLocalFile.mockClear();
    mockWriteZip.mockClear();
    mockHasRequiredDataForTemplate.mockClear();
  });

  test("a document template is added when the template is supported", async () => {
    const config = {
      sessionId: "1234",
      passport: { data: {} },
      zip: new AdmZip(),
      tmpDir: "temp"
    };
    await addTemplateFilesToZip(config);
    expect(mockAddLocalFile).toHaveBeenCalledWith("temp/X.doc");
    expect(mockAddLocalFile).toHaveBeenCalledWith("temp/Y.doc");
  });

  test("a document template is not added when the template is not supported", async () => {
    mockHasRequiredDataForTemplate
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const config = {
      sessionId: "1234",
      passport: { data: {} },
      zip: new AdmZip(),
      tmpDir: "temp"
    };
    await addTemplateFilesToZip(config);
    expect(mockAddLocalFile).not.toHaveBeenCalledWith("temp/X.doc");
    expect(mockAddLocalFile).toHaveBeenCalledWith("temp/Y.doc");
  });

});