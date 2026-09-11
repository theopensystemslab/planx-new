import supertest from "supertest";

import app from "../../../../server.js";
import { sanitiseApplicationData } from "./index.js";
import * as operations from "./operations.js";

const mockSend = vi.fn();
const mockSlackNotify = vi.fn().mockImplementation(() => {
  return { send: mockSend };
});
vi.mock("slack-notify", () => ({
  default: (webhookURL: string) => mockSlackNotify(webhookURL),
}));

const { post } = supertest(app);

describe("sanitiseApplicationData", () => {
  it("aggregates results and does not post to Slack when all operations succeed", async () => {
    const mockOperation1 = vi.fn().mockResolvedValue(["123"]);
    const mockOperation2 = vi.fn().mockResolvedValue(["456", "789"]);

    vi.spyOn(operations, "getOperations").mockReturnValueOnce([
      mockOperation1,
      mockOperation2,
    ]);

    const { operationFailed, results } = await sanitiseApplicationData();

    expect(operationFailed).toBe(false);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: "success", count: 1 }),
        expect.objectContaining({ status: "success", count: 2 }),
      ]),
    );
    expect(mockSlackNotify).not.toHaveBeenCalled();
  });

  it("posts to Slack and marks operationFailed when an operation fails", async () => {
    const mockOperation1 = vi.fn().mockResolvedValue(["123"]);
    const mockOperation2 = vi
      .fn()
      .mockRejectedValue(new Error("Query failed!"));

    vi.spyOn(operations, "getOperations").mockReturnValueOnce([
      mockOperation1,
      mockOperation2,
    ]);

    const { operationFailed, results } = await sanitiseApplicationData();

    expect(operationFailed).toBe(true);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: "failure",
          errorMessage: "Query failed!",
        }),
      ]),
    );
    expect(mockSlackNotify).toHaveBeenCalledWith(process.env.SLACK_WEBHOOK_URL);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringMatching(/Error: Query failed!/),
      }),
    );
  });
});

describe("Sanitise application data webhook", () => {
  const ENDPOINT = "/webhooks/hasura/sanitise-application-data";

  it("returns a 401 without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 202 when called with correct authorization", async () => {
    const mockOperation1 = vi.fn().mockResolvedValue(["123"]);
    vi.spyOn(operations, "getOperations").mockReturnValueOnce([mockOperation1]);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(202)
      .then((response) => {
        expect(response.body).toEqual({
          message: "Sanitation job started",
        });
      });
  });

  it("still returns a 202 and logs the error if sanitiseApplicationData rejects", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const sanitiseModule = await import("./index.js");
    const mockSanitiseApplicationData = vi
      .spyOn(sanitiseModule, "sanitiseApplicationData")
      .mockRejectedValueOnce(new Error("Unhandled failure!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(202)
      .then((response) => {
        expect(response.body).toEqual({ message: "Sanitation job started" });
      });

    await vi.waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Unhandled error in sanitiseApplicationData",
        expect.any(Error),
      ),
    );

    mockSanitiseApplicationData.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
