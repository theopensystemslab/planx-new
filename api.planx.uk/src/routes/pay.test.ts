import supertest from "supertest";
import app from "../routes";
import nock from "nock";

const { get, post } = supertest(app);

describe("pay routes", () => {
  describe("/pay/:localAuthority", () => {
    test("unknown :localAuthority", async () => {
      nock("https://publicapi.payments.service.gov.uk")
        .post("/v1/payments")
        .reply(400);

      await post("/pay/wrong").expect(400);
    });
  });

  describe("/pay/:localAuthority/:paymentId", () => {
    test("unknown :localAuhority", async () => {
      nock("https://publicapi.payments.service.gov.uk")
        .get("/v1/payments/1")
        .reply(400, {
          payment_id: 123,
          amount: 0,
          state: "paid",
          payment_provider: "sandbox",
        });

      await get("/pay/wrong/1").expect(400);
    });
  });
});
