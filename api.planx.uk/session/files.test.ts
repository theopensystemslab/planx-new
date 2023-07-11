import { queryMock } from "../tests/graphqlQueryMock";
import { getFilesForSession } from "./files";
import { multipleFilesMultipleQuestions } from "./mocks/passports";

const mockGetFiles = jest.fn();

jest.mock("@opensystemslab/planx-core", () => {
  return {
    Passport: jest.fn().mockImplementation(() => ({
      getFiles: mockGetFiles,
    })),
  };
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
    mockGetFiles.mockResolvedValue(new Array(0));
    expect(await getFilesForSession("sessionId")).toEqual([]);
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
    mockGetFiles.mockResolvedValue(new Array(7));
    expect(await getFilesForSession("sessionId")).toHaveLength(7);
  });

  it("handles errors when querying", async () => {
    queryMock.mockQuery({
      name: "GetPassportDataForSession",
      graphqlErrors: [
        {
          error: "Something went wrong",
        },
      ],
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
