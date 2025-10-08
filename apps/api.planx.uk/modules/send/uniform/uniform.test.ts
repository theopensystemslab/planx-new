import supertest from "supertest";
import app from "../../../server.js";

describe(`sending an application to uniform`, () => {
  it("fails without authorization header", async () => {
    await supertest(app)
      .post("/uniform/southwark")
      .send({ payload: { sessionId: "123" } })
      .expect(401);
  });

  it("errors if the payload body does not include a sessionId", async () => {
    await supertest(app)
      .post("/uniform/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { somethingElse: "123" } })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });
});
