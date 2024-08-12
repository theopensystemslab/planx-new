import supertest from "supertest";
import app from "../../../server.js";

describe(`sending an application to Idox Nexus`, () => {
  it("fails without authorization header", async () => {
    await supertest(app)
      .post("/idox/southwark")
      .send({ payload: { sessionId: "123" } })
      .expect(401);
  });

  it("errors if the payload body does not include a sessionId", async () => {
    await supertest(app)
      .post("/idox/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { somethingElse: "123" } })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Missing application data to send to Idox Nexus",
        });
      });
  });
});
