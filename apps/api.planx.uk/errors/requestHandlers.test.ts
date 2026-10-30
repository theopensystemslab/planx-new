import express from "express";
import supertest from "supertest";

import airbrake from "../airbrake.js";
import { errorHandler } from "./requestHandlers.js";
import { ServerError } from "./serverError.js";

vi.mock("../airbrake.js", () => ({
  default: { notify: vi.fn() },
}));

describe("errorHandler", () => {
  it("reports the cause of an error to Airbrake", async () => {
    const tree = {
      errors: [],
      properties: { applicant: { errors: ["Invalid input"] } },
    };
    const error = new ServerError({
      message: "Failed to make zip",
      cause: new Error("Invalid OneApp Payload", { cause: tree }),
    });

    const app = express()
      .get("/", (_req, _res, next) => next(error))
      .use(errorHandler);

    await supertest(app)
      .get("/")
      .expect(500)
      .then((res) => {
        expect(res.body.error).toBe(
          "Failed to make zip, this error has been logged",
        );
      });

    expect(airbrake!.notify).toHaveBeenCalledWith({
      error,
      context: { cause: { message: "Invalid OneApp Payload", cause: tree } },
    });
  });
});
