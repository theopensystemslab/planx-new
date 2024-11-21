import supertest from "supertest";
import app from "../../../server.js";

it("requires auth", async () => {
  await supertest(app)
    .post("/goss/west-berkshire")
    .send({ payload: { sessionId: "37e3649b-4854-4249-a5c3-7937c1b952b9" } })
    .expect(401);
});

it("throws an error if payload is missing", async () => {
  await supertest(app)
    .post("/goss/west-berkshire")
    .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
    .send({ payload: null })
    .expect(400)
    .then((res) => {
      expect(res.body).toHaveProperty("issues");
      expect(res.body).toHaveProperty("name", "ZodError");
    });
});

it("throws an error if team is unsupported", async () => {
  await supertest(app)
    .post("/goss/unsupported-team")
    .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
    .send({ payload: { sessionId: "37e3649b-4854-4249-a5c3-7937c1b952b9" } })
    .expect(400)
    .then((res) => {
      expect(res.body.error).toMatch(
        /Cannot submit to GOSS. Team "unsupported-team" does not support this integration./,
      );
    });
});

it.todo("does not re-send an application which has already been submitted");
it.todo("creates an audit record after submitting");
it.todo("returns a success upon completion");
