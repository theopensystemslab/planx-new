import supertest from "supertest";
import app from "../../server";

describe("Session setup", () => {
  test("adds dummy methods to req.session to avoid passport/cookie-session incompatibility issue", async () => {
    await supertest(app)
      .get("/test-session")
      .expect(200)
      .then((res) => {
        expect(res.body.hasRegenerate).toBe(true);
        expect(res.body.hasSave).toBe(true);
      });
  });
});
