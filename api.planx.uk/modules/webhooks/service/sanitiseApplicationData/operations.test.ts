import { runSQL } from "../../../../lib/hasura/schema";
import { queryMock } from "../../../../tests/graphqlQueryMock";
import {
  mockIds,
  mockSanitiseBOPSApplicationsMutation,
  mockSanitiseEmailApplicationsMutation,
  mockSanitiseLowcalSessionsMutation,
  mockDeleteReconciliationRequestsMutation,
  mockSanitiseUniformApplicationsMutation,
  mockGetExpiredSessionIdsQuery,
  mockDeletePaymentRequests,
} from "./mocks/queries";
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
} from "./operations";

jest.mock("../../../../lib/hasura/schema");
const mockRunSQL = runSQL as jest.MockedFunction<typeof runSQL>;

const mockFindSession = jest.fn();

jest.mock("@opensystemslab/planx-core", () => {
  const actualCoreDomainClient = jest.requireActual(
    "@opensystemslab/planx-core",
  ).CoreDomainClient;

  const actualPassport = jest.requireActual(
    "@opensystemslab/planx-core",
  ).Passport;

  return {
    Passport: actualPassport,
    CoreDomainClient: class extends actualCoreDomainClient {
      constructor() {
        super();
        this.session.find = jest
          .fn()
          .mockImplementation(() => mockFindSession());
      }
    },
  };
});

const s3Mock = () => {
  return {
    deleteObjects: jest.fn(() => ({
      promise: () => Promise.resolve(),
    })),
  };
};

jest.mock("aws-sdk/clients/s3", () => {
  return jest.fn().mockImplementation(() => {
    return s3Mock();
  });
});

describe("'operationHandler' helper function", () => {
  it("returns a success result when an operation succeeds", async () => {
    const successOperation = jest
      .fn()
      .mockResolvedValue(["123", "abc", "456", "xyz"]);
    await expect(operationHandler(successOperation)).resolves.toEqual({
      operationName: "mockConstructor",
      status: "success",
      count: 4,
    });
  });

  it("returns a failure result when an operation fails", async () => {
    const failureOperation = jest
      .fn()
      .mockRejectedValue(new Error("Something went wrong"));
    await expect(operationHandler(failureOperation)).resolves.toEqual({
      operationName: "mockConstructor",
      status: "failure",
      errorMessage: "Something went wrong",
    });
  });
});

describe("getRetentionPeriod helper function", () => {
  afterAll(() => jest.useRealTimers());

  it("returns a date 6 months in the past", () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-08-01"));

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
  });

  describe("deleteApplicationFiles", () => {
    it("returns a QueryResult on success", async () => {
      queryMock.mockQuery(mockGetExpiredSessionIdsQuery);
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
  });
});
