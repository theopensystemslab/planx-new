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
jest.mock("csv-stringify", () => {
  return {
    stringify: jest.fn().mockImplementation(() => mockPipe),
  };
});
jest.mock("./documentReview", () => {
  return {
    generateDocumentReviewStream: jest.fn().mockImplementation(() => mockPipe),
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

  test("the overview document is added to zip", async () => {
    const payload = {
      xml: "<xml></xml>",
      csv: [["1", "2", "3"]],
      files: [],
      sessionId: "123",
    };
    await createUniformSubmissionZip(payload); // TODO: now need to mock the submission API call
    expect(mockAddLocalFile).toHaveBeenCalledWith("overview.html");
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("geojson is added to zip", async () => {
    const input = { x: 1, y: 50 };
    const payload = {
      xml: "<xml></xml>",
      csv: [["1", "2", "3"]],
      geojson: input,
      files: [],
      sessionId: "123",
    };
    const expectedBuffer = Buffer.from(JSON.stringify(input, null, 2));
    await createUniformSubmissionZip(payload);
    expect(mockAddFile).toHaveBeenCalledWith(
      "boundary.geojson",
      expectedBuffer
    );
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });

  test("geojson is excluded when not present", async () => {
    const payload = {
      xml: "<xml></xml>",
      csv: [["1", "2", "3"]],
      geojson: undefined,
      files: [],
      sessionId: "123",
    };
    await createUniformSubmissionZip(payload);
    expect(mockAddFile).not.toHaveBeenCalled();
    expect(mockWriteZip).toHaveBeenCalledTimes(1);
  });
});
