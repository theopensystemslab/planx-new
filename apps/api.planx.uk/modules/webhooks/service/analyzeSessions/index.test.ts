import supertest from "supertest";

import app from "../../../../server.js";
import * as operations from "./operations.js";
import * as sharedOperations from "../sanitiseApplicationData/operations.js";

const mockSend = vi.fn();
const mockSlackNotify = vi.fn().mockImplementation(() => {
  return { send: mockSend };
});
vi.mock("slack-notify", () => ({
  default: (webhookURL: string) => mockSlackNotify(webhookURL),
}));

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
    const mockOperationHandler = vi.spyOn(sharedOperations, "operationHandler");
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
    const mockOperation1 = vi.fn().mockResolvedValue(["123"]);
    const mockOperation2 = vi.fn().mockResolvedValue(["456", "789"]);
    const mockOperation3 = vi.fn().mockResolvedValue(["abc", "def", "ghi"]);

    const mockGetOperations = vi.spyOn(
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
    const mockOperation1 = vi.fn().mockResolvedValue(["123"]);
    const mockOperation2 = vi
      .fn()
      .mockRejectedValue(new Error("Query failed!"));
    const mockOperation3 = vi.fn().mockResolvedValue(["abc", "def", "ghi"]);

    const mockGetOperations = vi.spyOn(
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
    const mockOperation1 = vi
      .fn()
      .mockRejectedValue(new Error("Query failed!"));
    const mockOperation2 = vi
      .fn()
      .mockRejectedValue(new Error("Query failed!"));
    const mockOperation3 = vi
      .fn()
      .mockRejectedValue(new Error("Query failed!"));

    const mockGetOperations = vi.spyOn(
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
