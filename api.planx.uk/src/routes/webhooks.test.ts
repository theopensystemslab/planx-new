import supertest from "supertest";
import app from "../routes";

const { post } = supertest(app);

describe("webhook routes", () => {
  describe("/webhooks/hasura", () => {
    test("missing auth", async () => {
      await post("/webhooks/hasura/").expect(401);
    });
  });

  describe("/webhooks/hasura/delete-expired-sessions", () => {
    test("missing auth", async () => {
      await post("/webhooks/hasura/delete-expired-sessions").expect(401);
    });
  });

  describe("/webhooks/hasura/create-reminder-event", () => {
    test("missing auth", async () => {
      await post("/webhooks/hasura/create-reminder-event").expect(401);
    });
  });

  describe("/webhooks/hasura/create-expiry-event", () => {
    test("missing auth", async () => {
      await post("/webhooks/hasura/create-expiry-event").expect(401);
    });
  });

  describe("/webhooks/hasura/send-slack-notification", () => {
    test("missing auth", async () => {
      await post("/webhooks/hasura/send-slack-notification").expect(401);
    });
  });
});
