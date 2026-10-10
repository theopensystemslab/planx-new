import { subDays } from "date-fns";
import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";

import { getPaymentRequest } from "./payQueries";

const mockPaymentRequest = (
  overrides: { paidAt?: string | null; createdAt?: string } = {},
) => ({
  id: crypto.randomUUID(),
  sessionPreviewData: {},
  feeBreakdown: null,
  createdAt: new Date().toISOString(),
  paymentAmount: 12300,
  govPayPaymentId: null,
  stripePaymentId: null,
  paidAt: null,
  ...overrides,
});

const mockResponse = (paymentRequests: unknown[]) =>
  server.use(
    graphql.query("GetPaymentRequestById", () =>
      HttpResponse.json({ data: { paymentRequests } }),
    ),
  );

const expired = subDays(new Date(), 29).toISOString();

describe("getPaymentRequest", () => {
  it("returns an unpaid payment request", async () => {
    const paymentRequest = mockPaymentRequest();
    mockResponse([paymentRequest]);

    const result = await getPaymentRequest(paymentRequest.id);
    expect(result).toEqual(paymentRequest);
  });

  it("returns a paid payment request", async () => {
    const paymentRequest = mockPaymentRequest({
      paidAt: new Date().toISOString(),
    });
    mockResponse([paymentRequest]);

    const result = await getPaymentRequest(paymentRequest.id);
    expect(result).toEqual(paymentRequest);
  });

  it("returns a paid payment request after the expiry period", async () => {
    const paymentRequest = mockPaymentRequest({
      paidAt: expired,
      createdAt: expired,
    });
    mockResponse([paymentRequest]);

    const result = await getPaymentRequest(paymentRequest.id);
    expect(result).toEqual(paymentRequest);
  });

  it("does not return an unpaid payment request after the expiry period", async () => {
    const paymentRequest = mockPaymentRequest({ createdAt: expired });
    mockResponse([paymentRequest]);

    const result = await getPaymentRequest(paymentRequest.id);
    expect(result).toBeUndefined();
  });

  it("does not return a payment request which does not exist", async () => {
    mockResponse([]);

    const result = await getPaymentRequest(crypto.randomUUID());
    expect(result).toBeUndefined();
  });
});
