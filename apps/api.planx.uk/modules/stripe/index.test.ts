import supertest from "supertest";

import app from "../../server.js";

const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));

vi.mock("stripe", () => ({
  default: class MockStripe {
    checkout = { sessions: { create: mockCreate } };
  },
}));

const validBody = {
  sessionId: "f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c",
  flowId: "7cd1c4b4-4229-424f-8d04-c9fdc958ef4e",
  amount: 14500,
  returnURL: "https://editor.planx.uk/team/flow/published",
};

describe("creating a Stripe Checkout Session", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({
      id: "cs_test_a1b2c3",
      url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
    });
  });

  it("returns the hosted Checkout Session URL", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
        });
      });
  });

  it("creates the session with the expected payload", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "gbp",
              unit_amount: 14500,
            }),
            quantity: 1,
          }),
        ],
        success_url:
          "https://editor.planx.uk/team/flow/published?stripeSessionId={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://editor.planx.uk/team/flow/published?cancelled=true",
        metadata: {
          sessionId: validBody.sessionId,
          flowId: validBody.flowId,
        },
        payment_intent_data: {
          metadata: {
            sessionId: validBody.sessionId,
            flowId: validBody.flowId,
          },
        },
      }),
    );
  });

  it("rejects an invalid request body with a 400", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, amount: -1, sessionId: "not-a-uuid" })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns a 500 when Stripe rejects the request", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Stripe is down"));

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(500);
  });
});
