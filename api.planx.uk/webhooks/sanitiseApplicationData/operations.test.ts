import { queryMock } from "../../tests/graphqlQueryMock";
import { mockIds, mockSanitiseBOPSApplicationsMutation, mockSanitiseLowcalSessionsMutation, mockSanitiseSessionBackupsMutation, mockSanitiseUniformApplicationsMutation } from "./mocks/queries";
import { getRetentionPeriod, operationHandler, sanitiseBOPSApplications, sanitiseLowcalSessions, sanitiseSessionBackups, sanitiseUniformApplications } from "./operations";

describe("'operationHandler' helper function", () => {
  it("returns a success result when an operation succeeds", async () => {
    const successOperation = jest.fn().mockResolvedValue([
      "123", "abc", "456", "xyz"
    ]);
    await expect(operationHandler(successOperation)).resolves.toEqual({
      operationName: "mockConstructor",
      result: "success",
      deleteCount: 4,
    });
  });

  it("returns a failure result when an operation fails", async () => {
    const failureOperation = jest.fn().mockRejectedValue(new Error("Something went wrong"))
    await expect(operationHandler(failureOperation)).resolves.toEqual({
      operationName: "mockConstructor",
      result: "failure",
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

describe("Data sanitation operations", () => {
  const testCases = [
    {
      operation: sanitiseLowcalSessions,
      query: mockSanitiseLowcalSessionsMutation,
    },
    {
      operation: sanitiseSessionBackups,
      query: mockSanitiseSessionBackupsMutation,
    },
    {
      operation: sanitiseUniformApplications,
      query: mockSanitiseUniformApplicationsMutation,
    },
    {
      operation: sanitiseBOPSApplications,
      query: mockSanitiseBOPSApplicationsMutation,
    },
  ];

  for (const { operation, query } of testCases) {
    test(`${operation.name} returns a QueryResult on success`, async () => {
      queryMock.mockQuery(query);
      const result = await operation();
      expect(result).toEqual(mockIds);
    })
  }
});