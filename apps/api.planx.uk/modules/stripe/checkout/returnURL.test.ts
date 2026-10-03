import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import {
  mockCreate,
  mockCreateCheckoutSessionDefaults,
  mockReturnURLContext,
  RETURN_URL,
  validBody,
} from "./test/mocks.js";

vi.mock(
  "stripe",
  async () => (await import("./test/mocks.js")).mockStripeModule,
);
vi.mock(
  "../connect/service.js",
  async () => (await import("./test/mocks.js")).mockConnectServiceModule,
);

describe("building the Checkout return URL", () => {
  beforeEach(() => {
    mockCreateCheckoutSessionDefaults();
  });

  it("returns published services to the team's custom domain", async () => {
    mockReturnURLContext({
      flow: {
        slug: "apply",
        team: {
          slug: "southwark",
          domain: "planningservices.southwark.gov.uk",
        },
      },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { success_url } = mockCreate.mock.calls[0][0];
    expect(success_url).toBe(
      "https://planningservices.southwark.gov.uk/apply?stripeSessionId={CHECKOUT_SESSION_ID}",
    );
  });

  it("carries sessionId and email for Save & Return sessions, so the applicant can resume", async () => {
    mockReturnURLContext({
      session: { flowId: validBody.flowId, email: "applicant@example.com" },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { success_url, cancel_url } = mockCreate.mock.calls[0][0];
    const resumeParams = `sessionId=${validBody.sessionId}&email=applicant%40example.com`;
    expect(success_url).toBe(
      `${RETURN_URL}?${resumeParams}&stripeSessionId={CHECKOUT_SESSION_ID}`,
    );
    expect(cancel_url).toBe(`${RETURN_URL}?${resumeParams}&cancelled=true`);
  });

  it("omits resume params when the session hasn't been saved", async () => {
    mockReturnURLContext({ session: null });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { success_url } = mockCreate.mock.calls[0][0];
    expect(success_url).toBe(
      `${RETURN_URL}?stripeSessionId={CHECKOUT_SESSION_ID}`,
    );
  });

  it("ignores a client-supplied returnURL", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, returnURL: "https://evil.example.org/phishing" })
      .expect(200);

    const { success_url, cancel_url } = mockCreate.mock.calls[0][0];
    expect(success_url).toBe(
      `${RETURN_URL}?stripeSessionId={CHECKOUT_SESSION_ID}`,
    );
    expect(cancel_url).toBe(`${RETURN_URL}?cancelled=true`);
  });

  it("rejects a flow which doesn't exist with a 400", async () => {
    mockReturnURLContext({ flow: null });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects another team's flow with a 400", async () => {
    mockReturnURLContext({
      flow: { slug: "apply", team: { slug: "lambeth", domain: null } },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a session from a different flow with a 400", async () => {
    mockReturnURLContext({
      session: {
        flowId: "00000000-0000-4000-8000-000000000000",
        email: "applicant@example.com",
      },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("surfaces an error when the return URL lookup fails", async () => {
    queryMock.mockQuery({
      name: "GetCheckoutReturnURLContext",
      matchOnVariables: false,
      status: 500,
      data: {},
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(500);

    expect(mockCreate).not.toHaveBeenCalled();
  });
});
