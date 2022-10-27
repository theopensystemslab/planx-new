import supertest from "supertest";
import app from "../src/routes";
import nock from "nock";
import { queryMock } from "./graphqlQueryMock";
import { mockGetFlowData } from "./mocks/flowMocks";
import { authHeader } from "./mockJWT";

const { get, post } = supertest(app);

describe("bad requests", () => {
  test.skip(`app.post("/bops/:localAuthority")`, (done) => {
    post("/bops/wrong").expect(404, done);
  });

  test(`app.post("/pay/:localAuthority")`, (done) => {
    nock("https://publicapi.payments.service.gov.uk")
      .post("/v1/payments")
      .reply(400);

    post("/pay/wrong").expect(400, done);
  });

  test(`app.get("/pay/:localAuthority/:paymentId")`, (done) => {
    nock("https://publicapi.payments.service.gov.uk")
      .get("/v1/payments/1")
      .reply(400, {
        payment_id: 123,
        amount: 0,
        state: "paid",
        payment_provider: "sandbox",
      });

    get("/pay/wrong/1").expect(400, done);
  });

  test(`app.get("/hasura")`, (done) => {
    get("/hasura").expect(500, done);
  });

  test(`app.get("/me")`, (done) => {
    get("/me")
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "No authorization token was found",
        });
        done();
      })
      .catch(done);
  });

  test(`app.get("/gis")`, (done) => {
    get("/gis").expect(400, done);
  });

  test(`app.get("/gis/wrong")`, (done) => {
    get("/gis/wrong")
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          error: "wrong is not a supported local authority",
        });
        done();
      });
  });

  test(`app.get("/throw-error")`, (done) => {
    get("/throw-error").expect(500, done);
  });

  test(`app.post("/flows/:flowId/publish")`, (done) => {
    post("/flows/WRONG/publish").expect(401, done);
  });

  test(`app.post("/flows/:flowId/download-schema")`, (done) => {
    post("/flows/WRONG/download-schema").expect(404, done);
  });

  test(`app.post("/flows/:flowId/search?find") for missing JWT`, async () => {
    await post("/flows/1/search?find=x")
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "No authorization token was found",
        });
      });
  });

  test(`app.post("/flows/:flowId/search") for unknown flowId`, async () => {
    await supertest(app)
      .post("/flows/WRONG/search")
      .set(authHeader())
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual("Unknown flowId");
      });
  });

  test(`app.post("/flows/:flowId/search") for missing find parameter`, async () => {
    queryMock.reset();
    queryMock.mockQuery(mockGetFlowData);
    await supertest(app)
      .post("/flows/1/search")
      .set(authHeader())
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual(
          'Expected at least one query parameter "find"'
        );
      });
  });

  test(`app.post("/sign-s3-upload")`, (done) => {
    post("/sign-s3-upload").expect(422, done);
  });

  // useHasuraAuth
  test(`app.post("/webhooks/hasura/delete-expired-sessions")`, (done) => {
    post("/webhooks/hasura/delete-expired-sessions").expect(401, done);
  });

  test(`app.post("/webhooks/hasura/create-reminder-event")`, (done) => {
    post("/webhooks/hasura/").expect(401, done);
  });

  test(`app.post("/webhooks/hasura/create-expiry-event")`, (done) => {
    post("/webhooks/hasura/").expect(401, done);
  });

  test(`app.post("/webhooks/hasura/send-slack-notification")`, (done) => {
    post("/webhooks/hasura/").expect(401, done);
  });
});
