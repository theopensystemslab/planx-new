import supertest from "supertest";
import app from "../server";
import nock from "nock";

const { get, post } = supertest(app);

describe("bad requests", () => {
  test.skip(`app.post("/bops/:localAuthority")`, async () => {
    await post("/bops/wrong").expect(404);
  });

  test(`app.post("/pay/:localAuthority")`, async () => {
    nock("https://publicapi.payments.service.gov.uk")
      .post("/v1/payments")
      .reply(400);

    await post("/pay/wrong").expect(400);
  });

  test(`app.get("/pay/:localAuthority/:paymentId")`, async () => {
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

  test(`app.get("/gis")`, async () => {
    await get("/gis").expect(400);
  });

  test(`app.get("/gis/wrong")`, async () => {
    await get("/gis/wrong")
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          error: "wrong is not a supported local authority",
        });
      });
  });

  test(`app.post("/flows/:flowId/publish")`, async () => {
    await post("/flows/WRONG/publish").expect(401);
  });

  test(`app.post("/flows/:flowId/download-schema")`, async () => {
    await post("/flows/WRONG/download-schema").expect(404);
  });
});
