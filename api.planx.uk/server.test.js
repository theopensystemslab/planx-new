import supertest from "supertest";

import app from "./server";

describe("authentication", () => {
  test("Failed login endpoint", async () => {
    await supertest(app)
      .get("/auth/login/failed")
      .expect(401)
      .then((res) => {
        expect(res.body).toEqual({ error: "User failed to authenticate" });
      });
  });
});
