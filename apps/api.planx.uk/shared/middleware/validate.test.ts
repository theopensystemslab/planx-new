import type { ErrorRequestHandler } from "express";
import express from "express";
import supertest from "supertest";
import { z } from "zod";

import { validate } from "./validate.js";

const schema = z.object({
  body: z.object({
    id: z.uuid(),
    name: z.string().transform((name) => {
      if (name === "explode") throw new Error("Unexpected failure");
      return name.toUpperCase();
    }),
  }),
});

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  res.status(500).json({ error: error.message });
};

const app = express()
  .use(express.json())
  .post("/", validate(schema), (_req, res) => {
    res.json(res.locals.parsedReq.body);
  })
  .use(handleError);

describe("validate middleware", () => {
  it("passes the parsed request to the next handler", async () => {
    const id = "3a9d3b4e-2f0c-4b7a-9c1d-5e6f7a8b9c0d";

    await supertest(app)
      .post("/")
      .send({ id, name: "planx" })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({ id, name: "PLANX" });
      });
  });

  it("returns a readable message and the raw issues for an invalid request", async () => {
    await supertest(app)
      .post("/")
      .send({ id: "not-a-uuid", name: "planx" })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: expect.stringContaining("→ at body.id"),
          issues: [
            expect.objectContaining({
              code: "invalid_format",
              format: "uuid",
              path: ["body", "id"],
            }),
          ],
        });
      });
  });

  it("passes errors which are not validation errors to the error handler", async () => {
    await supertest(app)
      .post("/")
      .send({ id: "3a9d3b4e-2f0c-4b7a-9c1d-5e6f7a8b9c0d", name: "explode" })
      .expect(500)
      .then((res) => {
        expect(res.body).toEqual({ error: "Unexpected failure" });
      });
  });
});
