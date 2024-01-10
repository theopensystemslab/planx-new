import supertest from "supertest";

import app from "../../../../server";
import * as operations from "./operations";
import * as sharedOperations from "../sanitiseApplicationData/operations";

const mockSend = jest.fn();
const mockSlackNotify = jest.fn().mockImplementation(() => {
  return { send: mockSend };
});
jest.mock("slack-notify", () => {
  return {
    __esModule: true, // see https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
    default: (webhookURL: string) => mockSlackNotify(webhookURL),
  };
});

const { post } = supertest(app);

describe("Analyze sessions webhook", () => {
  const ENDPOINT = "/webhooks/hasura/analyze-sessions";

  it("returns a 401 without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 500 if an unhandled error is thrown whilst running operations", async () => {
    const mockOperationHandler = jest.spyOn(
      sharedOperations,
      "operationHandler",
    );
    mockOperationHandler.mockRejectedValueOnce("Unhandled error!");

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(500)
      .then((response) =>
        expect(response.body.error).toMatch(
          /Failed to update session analytics/,
        ),
      );
  });

  it("returns a 200 when all operations are successful", async () => {
    const mockOperation1 = jest.fn().mockResolvedValue(["123"]);
    const mockOperation2 = jest.fn().mockResolvedValue(["456", "789"]);
    const mockOperation3 = jest.fn().mockResolvedValue(["abc", "def", "ghi"]);

    const mockGetOperations = jest.spyOn(
      operations,
      "getAnalyzeSessionOperations",
    );
    mockGetOperations.mockImplementationOnce(() => [
      mockOperation1,
      mockOperation2,
      mockOperation3,
    ]);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(200)
      .then((response) => {
        expect(mockOperation1).toHaveBeenCalled();
        expect(mockOperation2).toHaveBeenCalled();
        expect(mockOperation3).toHaveBeenCalled();

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              status: "success",
              count: 1,
            }),
            expect.objectContaining({
              status: "success",
              count: 2,
            }),
            expect.objectContaining({
              status: "success",
              count: 3,
            }),
          ]),
        );
      });
  });

  it("returns a 500 when only a single operation fails", async () => {
    const mockOperation1 = jest.fn().mockResolvedValue(["123"]);
    const mockOperation2 = jest
      .fn()
      .mockRejectedValue(new Error("Query failed!"));
    const mockOperation3 = jest.fn().mockResolvedValue(["abc", "def", "ghi"]);

    const mockGetOperations = jest.spyOn(
      operations,
      "getAnalyzeSessionOperations",
    );
    mockGetOperations.mockImplementationOnce(() => [
      mockOperation1,
      mockOperation2,
      mockOperation3,
    ]);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(500)
      .then((response) => {
        expect(mockOperation1).toHaveBeenCalled();
        expect(mockOperation2).toHaveBeenCalled();
        expect(mockOperation3).toHaveBeenCalled();

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              status: "success",
              count: 1,
            }),
            expect.objectContaining({
              status: "failure",
              errorMessage: "Query failed!",
            }),
            expect.objectContaining({
              status: "success",
              count: 3,
            }),
          ]),
        );

        expect(mockSlackNotify).toHaveBeenCalledWith(
          process.env.SLACK_WEBHOOK_URL,
        );
        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringMatching(/Error: Query failed!/),
          }),
        );
      });
  });

  it("returns a 500 if all operations fail", async () => {
    const mockOperation1 = jest
      .fn()
      .mockRejectedValue(new Error("Query failed!"));
    const mockOperation2 = jest
      .fn()
      .mockRejectedValue(new Error("Query failed!"));
    const mockOperation3 = jest
      .fn()
      .mockRejectedValue(new Error("Query failed!"));

    const mockGetOperations = jest.spyOn(
      operations,
      "getAnalyzeSessionOperations",
    );
    mockGetOperations.mockImplementationOnce(() => [
      mockOperation1,
      mockOperation2,
      mockOperation3,
    ]);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(500)
      .then((response) => {
        expect(mockOperation1).toHaveBeenCalled();
        expect(mockOperation2).toHaveBeenCalled();
        expect(mockOperation3).toHaveBeenCalled();

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              status: "failure",
              errorMessage: "Query failed!",
            }),
            expect.objectContaining({
              status: "failure",
              errorMessage: "Query failed!",
            }),
            expect.objectContaining({
              status: "failure",
              errorMessage: "Query failed!",
            }),
          ]),
        );
      });
  });
});
