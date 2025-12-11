import type * as planxCore from "@opensystemslab/planx-core";
import { runSQL } from "../../../../lib/hasura/schema/index.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import {
  mockIds,
  mockSanitiseBOPSApplicationsMutation,
  mockSanitiseEmailApplicationsMutation,
  mockSanitiseLowcalSessionsMutation,
  mockDeleteReconciliationRequestsMutation,
  mockSanitiseUniformApplicationsMutation,
  mockGetExpiredSessionIdsQuery,
  mockDeletePaymentRequests,
  mockDeleteFeedbackMutation,
} from "./mocks/queries.js";
import {
  deleteHasuraEventLogs,
  getRetentionPeriod,
  operationHandler,
  sanitiseBOPSApplications,
  sanitiseEmailApplications,
  sanitiseLowcalSessions,
  deleteReconciliationRequests,
  sanitiseUniformApplications,
  getExpiredSessionIds,
  deleteApplicationFiles,
  deletePaymentRequests,
  deleteHasuraScheduledEventsForSubmittedSessions,
  deleteFeedback,
} from "./operations.js";
import type { MockedFunction } from "vitest";

import type * as s3Client from "@aws-sdk/client-s3";

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
