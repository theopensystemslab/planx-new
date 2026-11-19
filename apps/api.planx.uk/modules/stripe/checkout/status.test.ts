import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { mockRetrieve, validBody } from "./test/mocks.js";

const SESSION_ID = validBody.sessionId;

vi.mock(
  "stripe",
  async () => (await import("./test/mocks.js")).mockStripeModule,
);

describe("retrieving a Stripe Checkout Session status", () => {
  beforeEach(() => {
    mockRetrieve.mockReset();
    queryMock.reset();
  });

  it("returns the status, payment status and PaymentIntent id", async () => {
    mockRetrieve.mockResolvedValue({
      id: "cs_test_a1b2c3",
      status: "complete",
      payment_status: "paid",
      payment_intent: "pi_test_a1b2c3",
    });

    await supertest(app)
      .get(`/stripe/checkout-session/southwark/cs_test_a1b2c3`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: "complete",
          paymentStatus: "paid",
          paymentIntentId: "pi_test_a1b2c3",
        });
      });

    expect(mockRetrieve).toHaveBeenCalledWith("cs_test_a1b2c3");
  });

  it("handles in-flight sessions with no PaymentIntent yet", async () => {
    mockRetrieve.mockResolvedValue({
      id: "cs_test_unpaid",
      status: "complete",
      payment_status: "unpaid",
      payment_intent: null,
    });

    await supertest(app)
      .get(`/stripe/checkout-session/southwark/cs_test_unpaid`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: "complete",
          paymentStatus: "unpaid",
          paymentIntentId: null,
        });
      });
  });

  it("locks the PlanX session while a delayed payment (e.g. Bacs) is processing", async () => {
    queryMock.mockQuery({
      name: "MarkDelayedPaymentPending",
      matchOnVariables: false,
      data: { started: { affectedRows: 1 }, locked: { affectedRows: 1 } },
    });
    mockRetrieve.mockResolvedValue({
      id: "cs_test_bacs",
      status: "complete",
      payment_status: "unpaid",
      payment_intent: "pi_test_bacs",
      metadata: { sessionId: SESSION_ID, origin: process.env.API_URL_EXT },
    });

    await supertest(app)
      .get(`/stripe/checkout-session/southwark/cs_test_bacs`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: "complete",
          paymentStatus: "unpaid",
          paymentIntentId: "pi_test_bacs",
        });
      });

    expect(
      queryMock
        .getCalls()
        .filter((call) => call.id === "MarkDelayedPaymentPending"),
    ).toHaveLength(1);
  });

  it("returns a 500 when Stripe rejects the request", async () => {
    mockRetrieve.mockRejectedValueOnce(new Error("No such checkout session"));

    await supertest(app)
      .get(`/stripe/checkout-session/southwark/cs_missing`)
      .expect(500);
  });
});
