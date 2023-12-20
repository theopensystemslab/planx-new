import supertest from "supertest";
import app from "../../server";

describe("healthcheck endpoint", () => {
  it("always returns a 200", async () => {
    await supertest(app)
      .get("/")
      .expect(200)
      .then((res) => expect(res.body).toHaveProperty("hello", "world"));
  });
});
