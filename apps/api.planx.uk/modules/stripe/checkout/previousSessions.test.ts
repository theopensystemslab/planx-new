import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import {
  getPaymentStatusInsert,
  mockPaymentStatusInsert,
} from "../webhook/test/mocks.js";
import {
  defaultMetadata,
  mockCreate,
  mockCreateCheckoutSessionDefaults,
  mockExpire,
  mockInitiatedCheckoutSessions,
  mockPassportLookup,
  mockRetrieve,
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

describe("tracking Checkout Sessions for a PlanX session", () => {
  beforeEach(() => {
    mockCreateCheckoutSessionDefaults();
  });

  describe("recording the payment as initiated", () => {
    it("records an 'initiated' payment status against the Checkout Session", async () => {
      mockCreate.mockResolvedValue({
        id: "cs_test_a1b2c3",
        url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
        amount_total: 14500,
      });

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(200);

      expect(getPaymentStatusInsert()?.variables).toEqual({
        sessionId: validBody.sessionId,
        flowId: validBody.flowId,
        teamSlug: "southwark",
        stripePaymentId: "cs_test_a1b2c3",
        stripeStatus: "initiated",
        amount: 14500,
        feeBreakdown: expect.objectContaining({
          amount: expect.objectContaining({ payable: 145 }),
        }),
        metadata: {
          ...defaultMetadata,
          sessionId: validBody.sessionId,
          origin: "https://api.example.com",
        },
      });
    });

    it("records the total Stripe will charge, not the client amount", async () => {
      mockCreate.mockResolvedValue({
        id: "cs_test_a1b2c3",
        url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
        amount_total: 16500,
      });

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(200);

      expect(getPaymentStatusInsert()?.variables?.amount).toBe(16500);
    });

    it("falls back to the client amount when Stripe returns no total", async () => {
      mockPassportLookup(null);

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(200);

      expect(getPaymentStatusInsert()?.variables).toEqual(
        expect.objectContaining({ amount: 14500, feeBreakdown: null }),
      );
    });

    it("does not return the Checkout Session URL if the payment status cannot be recorded", async () => {
      mockPaymentStatusInsert("fail");

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(500)
        .then((res) => {
          expect(JSON.stringify(res.body)).not.toContain(
            "https://checkout.stripe.com",
          );
        });
    });

    it("expires a Checkout Session which cannot be recorded, so it can never be paid", async () => {
      mockPaymentStatusInsert("fail");

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(500);

      expect(mockExpire).toHaveBeenCalledWith("cs_test_a1b2c3");
    });

    it("still returns an error if the unrecorded Checkout Session cannot be expired", async () => {
      mockPaymentStatusInsert("fail");
      mockExpire.mockRejectedValue(new Error("Stripe is down"));

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(500);

      expect(mockExpire).toHaveBeenCalledWith("cs_test_a1b2c3");
    });
  });

  describe("expiring previous Checkout Sessions for the session", () => {
    const mockPreviousSessions = (
      sessions: { id: string; status: string | null }[],
    ) => {
      mockInitiatedCheckoutSessions(sessions.map(({ id }) => id));
      mockRetrieve.mockImplementation(async (id: string) =>
        sessions.find((session) => session.id === id),
      );
      mockExpire.mockImplementation(async (id: string) => ({
        id,
        status: "expired",
      }));
    };

    it("looks up previously initiated Checkout Sessions for this session", async () => {
      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(200);

      const lookup = queryMock
        .getCalls()
        .find((call) => call.id === "GetInitiatedCheckoutSessions");
      expect(lookup?.variables).toEqual({ sessionId: validBody.sessionId });
      expect(mockRetrieve).not.toHaveBeenCalled();
      expect(mockExpire).not.toHaveBeenCalled();
    });

    it("expires an open Checkout Session before creating a new one", async () => {
      mockPreviousSessions([{ id: "cs_test_previous", status: "open" }]);

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
          });
        });

      expect(mockRetrieve).toHaveBeenCalledWith("cs_test_previous");
      expect(mockExpire).toHaveBeenCalledTimes(1);
      expect(mockExpire).toHaveBeenCalledWith("cs_test_previous");
      expect(mockExpire.mock.invocationCallOrder[0]).toBeLessThan(
        mockCreate.mock.invocationCallOrder[0],
      );
    });

    it("skips Checkout Sessions which have already expired", async () => {
      mockPreviousSessions([
        { id: "cs_test_expired", status: "expired" },
        { id: "cs_test_open", status: "open" },
      ]);

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(200);

      expect(mockRetrieve).toHaveBeenCalledTimes(2);
      expect(mockExpire).toHaveBeenCalledTimes(1);
      expect(mockExpire).toHaveBeenCalledWith("cs_test_open");
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("does not create a new Checkout Session if a previous one has been paid", async () => {
      mockPreviousSessions([{ id: "cs_test_paid", status: "complete" }]);

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(422);

      expect(mockExpire).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
      expect(getPaymentStatusInsert()).toBeUndefined();
    });

    it("still expires other open Checkout Sessions if a previous one has been paid", async () => {
      mockPreviousSessions([
        { id: "cs_test_paid", status: "complete" },
        { id: "cs_test_open", status: "open" },
      ]);

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(422);

      expect(mockExpire).toHaveBeenCalledWith("cs_test_open");
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("does not create a new Checkout Session if previous sessions cannot be looked up", async () => {
      queryMock.mockQuery({
        name: "GetInitiatedCheckoutSessions",
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

    it("does not create a new Checkout Session if a previous one cannot be retrieved from Stripe", async () => {
      mockInitiatedCheckoutSessions(["cs_test_previous"]);
      mockRetrieve.mockRejectedValue(new Error("Stripe is down"));

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(500);

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("does not create a new Checkout Session if a previous one cannot be expired", async () => {
      mockPreviousSessions([{ id: "cs_test_previous", status: "open" }]);
      mockExpire.mockRejectedValue(new Error("Stripe is down"));

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(500);

      expect(mockCreate).not.toHaveBeenCalled();
      expect(getPaymentStatusInsert()).toBeUndefined();
    });
  });
});
