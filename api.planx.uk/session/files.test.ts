import { queryMock } from "../tests/graphqlQueryMock";
import { extractFileURLsFromPassportData, getFilesForSession } from "./files"
import { multipleFileQuestions, multipleFilesMultipleQuestions, noFiles, singleFileQuestion } from "./mocks/passports"

describe("extractFileURLsFromPassportData() helper function", () => {
  it("handles Passports without files", () => {
    const passportData = noFiles
    expect(extractFileURLsFromPassportData(passportData)).toEqual([])
  });

  it("handles Passports with a single file question", () => {
    const passportData = singleFileQuestion
    const result = extractFileURLsFromPassportData(passportData)
    expect(result).toHaveLength(1)
    expect(result).toEqual([
      passportData["property.drawing.elevation"][0].url
    ])
  });

  it("handles Passports with multiple file questions", () => {
    const passportData = multipleFileQuestions;
    const result = extractFileURLsFromPassportData(passportData)
    expect(result).toHaveLength(2)
    expect(result).toEqual([
      passportData["property.drawing.elevation"][0].url,
      passportData["proposal.drawing.elevation"][0].url,
    ])
  });

  it("handles Passports with multiple files, across multiple questions", () => {
    const passportData = multipleFilesMultipleQuestions;
    const result = extractFileURLsFromPassportData(passportData)
    expect(result).toHaveLength(7)
    expect(result).toEqual([
      passportData["property.drawing.elevation"][0].url,
      passportData["property.drawing.elevation"][1].url,
      passportData["proposal.drawing.elevation"][0].url,
      passportData["property.drawing.sitePlan"][0].url,
      passportData["property.drawing.sitePlan"][1].url,
      passportData["property.drawing.sitePlan"][2].url,
      passportData["proposal.drawing.sitePlan"][0].url,
    ])
  });
});

describe("getFilesForSession()", () => {
  it("handles sessions without files", async () => {
    queryMock.mockQuery({
      name: "GetPassportDataForSession",
      matchOnVariables: false,
      data: {
        lowcal_sessions_by_pk: {
          data: null,
        },
      },
    });
    
    expect(await getFilesForSession("sessionId")).toEqual([])
  });

  it("handles sessions with files", async () => {
    queryMock.mockQuery({
      name: "GetPassportDataForSession",
      matchOnVariables: false,
      data: {
        lowcal_sessions_by_pk: {
          data: multipleFilesMultipleQuestions,
        },
      },
    });

    expect(await getFilesForSession("sessionId")).toHaveLength(7);
  });

  it("handles errors when querying", async () => {
    queryMock.mockQuery({
      name: "GetPassportDataForSession",
      graphqlErrors: [{
        error: "Something went wrong"
      }],
      matchOnVariables: false,
      data: {
        lowcal_sessions_by_pk: {
          data: multipleFilesMultipleQuestions,
        },
      },
    });

    await expect(getFilesForSession("sessionId")).rejects.toThrow();
  });
});