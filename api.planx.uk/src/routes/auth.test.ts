import supertest from "supertest";
import app from "../routes";

const { get } = supertest(app);

describe("auth routes", () => {
  describe("/auth", () => {
    test.todo("maybe test router is applied??");
  });

  describe("/me", () => {
    test("missing auth", async () => {
      await get("/me")
        .expect(401)
        .then((response) => {
          expect(response.body).toEqual({
            error: "No authorization token was found",
          });
        });
    });
  });
});
