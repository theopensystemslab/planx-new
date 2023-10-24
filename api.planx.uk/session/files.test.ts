import { getFilesForSession } from "./files";

const mockFindSession = jest.fn();

jest.mock("../client", () => {
  return {
    $api: {
      session: {
        find: jest.fn().mockImplementation(() => mockFindSession()),
      },
    },
  };
});

describe("getFilesForSession()", () => {
  it("handles sessions without files", async () => {
    mockFindSession.mockResolvedValue({
      data: { passport: {} },
    });
    expect(await getFilesForSession("sessionId")).toEqual([]);
  });

  it("handles sessions with files", async () => {
    mockFindSession.mockResolvedValue({
      data: {
        passport: {
          data: {
            "file.key": [
              {
                url: "https://my.test.file",
              },
            ],
          },
        },
      },
    });
    expect(await getFilesForSession("sessionId")).toEqual([
      "https://my.test.file",
    ]);
  });
});
