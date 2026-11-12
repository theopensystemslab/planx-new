import bodyParser from "body-parser";
import express from "express";
import nock from "nock";
import supertest from "supertest";

import { usePayProxy } from "./proxy.js";

const GOV_PAY_URL = "https://publicapi.payments.service.gov.uk/v1/payments";

const buildApp = (serverSideBody?: Record<string, unknown>) => {
  const app = express();
  app.use(bodyParser.json());
  app.post("/pay", (req, res, next) => {
    // mimic buildPaymentPayload(), which constructs the GovPay body server-side for invite-to-pay
    if (serverSideBody) req.body = serverSideBody;
    res.locals.govPayToken = "abc123";
    usePayProxy({ pathRewrite: () => "" }, req, res)(req, res, next);
  });
  return app;
};

describe("usePayProxy", () => {
  afterEach(() => nock.cleanAll());

  it("forwards a body built server-side when the incoming request has no body", async () => {
    const payload = { amount: 100, reference: "abc", description: "Test" };

    const scope = nock(GOV_PAY_URL)
      .post("", payload)
      .matchHeader("content-type", "application/json")
      .reply(201, { payment_id: "123" });

    // No .send() - the browser POSTs with an empty body for invite-to-pay
    await supertest(buildApp(payload)).post("/pay").expect(201);

    expect(scope.isDone()).toBe(true);
  });

  it("forwards a JSON body sent by the client", async () => {
    const payload = { amount: 200, reference: "def", description: "Test" };

    const scope = nock(GOV_PAY_URL)
      .post("", payload)
      .reply(201, { payment_id: "456" });

    await supertest(buildApp()).post("/pay").send(payload).expect(201);

    expect(scope.isDone()).toBe(true);
  });
});
