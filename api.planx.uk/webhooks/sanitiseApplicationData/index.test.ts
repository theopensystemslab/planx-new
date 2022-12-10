import supertest from "supertest";
import app from "../../server";
import * as operations from "./operations";

const { post } = supertest(app);

describe("Sanitise application data webhook", () => {
  const ENDPOINT = "/webhooks/hasura/sanitise-application-data";

  afterEach(() => jest.restoreAllMocks());

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
    const mockOperationHandler = jest.spyOn(operations, "operationHandler");
    mockOperationHandler.mockRejectedValue(new Error("Unhandled error!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .expect(500)
      .then((response) => expect(response.body.error).toMatch(/Unhandled error!/))
  });

  it("returns a 200 when all operations are successful", async () => {
    const mockOperation1 = jest.fn().mockResolvedValue(["123"]);
    const mockOperation2 = jest.fn().mockResolvedValue(["456", "789"]);
    const mockOperation3 = jest.fn().mockResolvedValue(["abc", "def", "ghi"]);

    const mockGetOperations = jest.spyOn(operations, "getOperations");
    mockGetOperations.mockImplementation(() => ([
      mockOperation1,
      mockOperation2,
      mockOperation3,
    ]));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .expect(200)
      .then((response) => {
        expect(mockOperation1).toHaveBeenCalled();
        expect(mockOperation2).toHaveBeenCalled();
        expect(mockOperation3).toHaveBeenCalled();

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              result: "success",
              deleteCount: 1,
            }),
            expect.objectContaining({
              result: "success",
              deleteCount: 2,
            }),
            expect.objectContaining({
              result: "success",
              deleteCount: 3,
            }),
          ])
        )
      });
  });

  it("returns a 500 when only a single operation fails", async () => {
    const mockOperation1 = jest.fn().mockResolvedValue(["123"]);
    const mockOperation2 = jest.fn().mockRejectedValue(new Error("Query failed!"));
    const mockOperation3 = jest.fn().mockResolvedValue(["abc", "def", "ghi"]);

    const mockGetOperations = jest.spyOn(operations, "getOperations");
    mockGetOperations.mockImplementation(() => ([
      mockOperation1,
      mockOperation2,
      mockOperation3,
    ]));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .expect(500)
      .then((response) => {
        expect(mockOperation1).toHaveBeenCalled();
        expect(mockOperation2).toHaveBeenCalled();
        expect(mockOperation3).toHaveBeenCalled();

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              result: "success",
              deleteCount: 1,
            }),
            expect.objectContaining({
              result: "failure",
              errorMessage: "Query failed!"
            }),
            expect.objectContaining({
              result: "success",
              deleteCount: 3,
            }),
          ])
        )
      });
  });

  it("returns a 500 if all operations fail", async () => {
    const mockOperation1 = jest.fn().mockRejectedValue(new Error("Query failed!"));
    const mockOperation2 = jest.fn().mockRejectedValue(new Error("Query failed!"));
    const mockOperation3 = jest.fn().mockRejectedValue(new Error("Query failed!"));

    const mockGetOperations = jest.spyOn(operations, "getOperations");
    mockGetOperations.mockImplementation(() => ([
      mockOperation1,
      mockOperation2,
      mockOperation3,
    ]));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .expect(500)
      .then((response) => {
        expect(mockOperation1).toHaveBeenCalled();
        expect(mockOperation2).toHaveBeenCalled();
        expect(mockOperation3).toHaveBeenCalled();

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              result: "failure",
              errorMessage: "Query failed!"
            }),
            expect.objectContaining({
              result: "failure",
              errorMessage: "Query failed!"
            }),
            expect.objectContaining({
              result: "failure",
              errorMessage: "Query failed!"
            }),
          ])
        )
      });
  });
});