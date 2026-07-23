import type * as s3Client from "@aws-sdk/client-s3";
import type * as planxCore from "@opensystemslab/planx-core";
import type { InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import { ClientError } from "graphql-request";
import type { MockedFunction } from "vitest";

import { runSQL } from "../../../../lib/hasura/schema/index.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import {
  mockDeleteFeedbackMutation,
  mockDeletePaymentRequests,
  mockDeleteReconciliationRequestsMutation,
  mockGetExpiredSessionIdsQuery,
  mockIds,
  mockSanitiseBOPSApplicationsMutation,
  mockSanitiseEmailApplicationsMutation,
  mockSanitiseLowcalSessionsMutation,
  mockSanitiseUniformApplicationsMutation,
} from "./mocks/queries.js";
import {
  deleteApplicationFiles,
  deleteFeedback,
  deleteHasuraEventLogs,
  deleteHasuraScheduledEventsForSubmittedSessions,
  deletePaymentRequests,
  deleteReconciliationRequests,
  formatOperationError,
  getExpiredSessionIds,
  getRetentionPeriod,
  operationHandler,
  sanitiseBOPSApplications,
  sanitiseEmailApplications,
  sanitiseLowcalSessions,
  sanitiseUniformApplications,
} from "./operations.js";

vi.mock("../../../../lib/hasura/schema");
const mockRunSQL = runSQL as MockedFunction<typeof runSQL>;

const mockFindSession = vi.fn();

vi.mock("@opensystemslab/planx-core", async (importOriginal) => {
  const actualCore = await importOriginal<typeof planxCore>();
  const actualCoreDomainClient = actualCore.CoreDomainClient;
  const actualPassport = actualCore.Passport;

  return {
    Passport: actualPassport,
    CoreDomainClient: class extends actualCoreDomainClient {
      constructor() {
        super();
        this.session.find = vi.fn().mockImplementation(() => mockFindSession());
      }
    },
  };
});

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
  const actualS3Client = await importOriginal<typeof s3Client>();

  class MockS3 {
    deleteObjects = vi.fn(() => Promise.resolve());
  }

  return {
    ...actualS3Client,
    S3: MockS3,
  };
});

describe("'operationHandler' helper function", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a success result when an operation succeeds", async () => {
    const successOperation = vi
      .fn()
      .mockResolvedValue(["123", "abc", "456", "xyz"]);
    await expect(operationHandler(successOperation)).resolves.toEqual({
      operationName: "Mock",
      status: "success",
      count: 4,
    });
  });

  it("returns a failure result when an operation fails", async () => {
    const failureOperation = vi
      .fn()
      .mockRejectedValue(new Error("Something went wrong"));
    await expect(operationHandler(failureOperation)).resolves.toEqual({
      operationName: "Mock",
      status: "failure",
      errorMessage: "Something went wrong",
    });
  });

  it("logs failures server-side", async () => {
    const failureOperation = vi
      .fn()
      .mockRejectedValue(new Error("Something went wrong"));

    await operationHandler(failureOperation);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Something went wrong"),
      expect.any(String),
    );
  });
});

describe("'formatOperationError' helper function", () => {
  it("returns concise details for failed GraphQL requests, without the query or variables included", () => {
    const error = new ClientError(
      {
        error: "",
        status: 502,
        headers: {},
      } as unknown as ClientError["response"],
      {
        query:
          "query GetExpiredSessionIds($retentionPeriod: timestamptz) { lowcal_sessions { id } }",
        variables: { retentionPeriod: "2026-01-23T04:46:22.557Z" },
      },
    );

    const result = formatOperationError(error);

    expect(result).toEqual("GraphQL Error (Code: 502)");
    expect(result).not.toContain("lowcal_sessions");
    expect(result).not.toContain("retentionPeriod");
  });

  it("returns the first GraphQL error message when present", () => {
    const error = new ClientError(
      {
        errors: [{ message: "postgres query error" }],
        status: 400,
      } as unknown as ClientError["response"],
      { query: "mutation DeleteFeedback { id }" },
    );

    expect(formatOperationError(error)).toEqual("postgres query error");
  });

  it("does not leak request config (e.g. auth headers) from AxiosErrors", () => {
    const error = new AxiosError(
      "Request failed with status code 502",
      AxiosError.ERR_BAD_RESPONSE,
      {
        headers: { "x-hasura-admin-secret": "super-secret-value" },
      } as unknown as InternalAxiosRequestConfig,
      null,
      {
        status: 502,
        data: "<html>Bad Gateway</html>",
      } as AxiosError["response"],
    );

    const result = formatOperationError(error);

    expect(result).toEqual("Request failed with status code 502");
    expect(result).not.toContain("super-secret-value");
    expect(JSON.stringify(error.toJSON())).toContain("super-secret-value");
  });

  it("prefers the API's error message when an AxiosError has one", () => {
    const error = new AxiosError(
      "Request failed with status code 500",
      AxiosError.ERR_BAD_RESPONSE,
      undefined,
      null,
      {
        status: 500,
        data: { message: "Internal server error from API" },
      } as AxiosError["response"],
    );

    expect(formatOperationError(error)).toEqual(
      "Internal server error from API",
    );
  });

  it("handles plain Error instances", () => {
    expect(formatOperationError(new Error("Something went wrong"))).toEqual(
      "Something went wrong",
    );
  });

  it("handles non-Error cases", () => {
    expect(formatOperationError("a thrown string")).toEqual("a thrown string");
    expect(formatOperationError(undefined)).toEqual("undefined");
  });
});

describe("getRetentionPeriod helper function", () => {
  afterAll(() => {
    vi.useRealTimers();
  });

  it("returns a date 6 months in the past", () => {
    vi.useFakeTimers().setSystemTime(new Date("2022-08-01"));

    const result = getRetentionPeriod();

    expect(result.toISOString()).toMatch(/^2022-02-01/);
  });
});

describe("getExpiredSessionIds helper function", () => {
  test("it returns formatted session ids", async () => {
    queryMock.mockQuery({
      name: "GetExpiredSessionIds",
      matchOnVariables: false,
      data: {
        lowcal_sessions: [{ id: "123" }, { id: "456" }, { id: "789" }],
      },
    });
    expect(await getExpiredSessionIds()).toEqual(["123", "456", "789"]);
  });
});

describe("Data sanitation operations", () => {
  describe("Simple GraphQL queries", () => {
    const testCases = [
      {
        operation: sanitiseLowcalSessions,
        query: mockSanitiseLowcalSessionsMutation,
      },
      {
        operation: sanitiseUniformApplications,
        query: mockSanitiseUniformApplicationsMutation,
      },
      {
        operation: sanitiseBOPSApplications,
        query: mockSanitiseBOPSApplicationsMutation,
      },
      {
        operation: sanitiseEmailApplications,
        query: mockSanitiseEmailApplicationsMutation,
      },
      {
        operation: deleteReconciliationRequests,
        query: mockDeleteReconciliationRequestsMutation,
      },
      {
        operation: deletePaymentRequests,
        query: mockDeletePaymentRequests,
      },
      {
        operation: deleteFeedback,
        query: mockDeleteFeedbackMutation,
      },
    ];

    for (const { operation, query } of testCases) {
      test(`${operation.name} returns a QueryResult on success`, async () => {
        queryMock.mockQuery(query);
        const result = await operation();
        expect(result).toEqual(mockIds);
      });
    }
  });

  describe("deleteHasuraEventLogs", () => {
    it("returns a QueryResult on success", async () => {
      mockRunSQL.mockResolvedValue({
        result: [["id"], [mockIds[0]], [mockIds[1]], [mockIds[2]]],
      });
      const result = await deleteHasuraEventLogs();
      expect(mockRunSQL).toHaveBeenCalled();
      expect(result).toEqual(mockIds);
    });

    it("handles empty responses", async () => {
      mockRunSQL.mockResolvedValue({
        result: undefined,
      });
      const result = await deleteHasuraEventLogs();
      expect(mockRunSQL).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });

  describe("deleteApplicationFiles", () => {
    beforeEach(() => {
      queryMock.mockQuery(mockGetExpiredSessionIdsQuery);
    });

    it("returns a QueryResult on success", async () => {
      const mockSession = {
        data: {
          passport: {
            data: {
              "file.key": [
                { url: "https://file.one" },
                { url: "https://file.two" },
                { url: "https://file.three" },
              ],
            },
          },
        },
      };
      mockFindSession.mockResolvedValue(mockSession);
      const filesPerMockSessionCount =
        mockSession.data.passport.data["file.key"].length;
      const deletedFiles = await deleteApplicationFiles();
      const fileCount = mockIds.length * filesPerMockSessionCount;
      expect(deletedFiles).toHaveLength(fileCount);
    });

    it("handles missing sessions", async () => {
      mockFindSession.mockResolvedValue(null);
      await expect(deleteApplicationFiles()).rejects.toThrow();
    });

    // for below cases, no files should be deleted, but nor should the operation error out
    it("skips over empty data fields", async () => {
      mockFindSession.mockResolvedValue({ data: {} });
      const deletedFiles = await deleteApplicationFiles();
      expect(deletedFiles).toHaveLength(0);
    });

    it("skips over malformed passports", async () => {
      mockFindSession.mockResolvedValue({
        data: { passport: { not_data: {} } },
      });
      const deletedFiles = await deleteApplicationFiles();
      expect(deletedFiles).toHaveLength(0);
    });
  });

  describe("deleteHasuraScheduledEventsForSubmittedSessions", () => {
    it("returns a QueryResult on success", async () => {
      mockRunSQL.mockResolvedValue({
        result: [["id"], [mockIds[0]], [mockIds[1]], [mockIds[2]]],
      });
      const result = await deleteHasuraScheduledEventsForSubmittedSessions();
      expect(mockRunSQL).toHaveBeenCalled();
      expect(result).toEqual(mockIds);
    });

    it("handles empty responses", async () => {
      mockRunSQL.mockResolvedValue({
        result: undefined,
      });
      const result = await deleteHasuraScheduledEventsForSubmittedSessions();
      expect(mockRunSQL).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });
});
