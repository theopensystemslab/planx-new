import supertest from "supertest";
import app from "../routes";

const { post } = supertest(app);

describe("integration routes", () => {
  describe("/bops/:localAuthority", () => {
    test.skip("missing :localAuthority", async () => {
      await post("/bops/wrong").expect(404);
    });
  });

  describe("/uniform/:localAuthority", () => {
    test.todo("TODO");
  });

  describe("/send-email/:template", () => {
    test.todo("TODO");
  });
});
