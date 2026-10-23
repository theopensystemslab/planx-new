import type Stripe from "stripe";

import { sendEmail } from "../../../../lib/resend/index.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
import { stripe } from "../../client.js";
import type { OwnedPaymentIntent } from "../ownership/service.js";
import {
  FLOW_ID,
  FLOW_NAME,
  mockChargedFeeBreakdown,
  mockCouncilInvoiceDetails,
  mockFeeBreakdown,
  paymentIntent,
  TEAM_NAME,
  TEAM_SLUG,
} from "../test/mocks.js";
import { generateVatInvoicePdf } from "./pdf.js";
import { buildCouncilEmailHeader, sendVatInvoices } from "./service.js";

vi.mock("../../../../lib/resend/index.js", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("./pdf.js", () => ({
  generateVatInvoicePdf: vi.fn(),
}));

const PDF = Buffer.from("%PDF-test");
const CUSTOMER_EMAIL = "payer@example.com";
const CHECKOUT_SESSION_ID = "cs_test_123";

// £145 total, of which £30 is the PlanX service charge (inc. £5 VAT)
const succeededPaymentIntent = (overrides: Record<string, unknown> = {}) =>
  ({
    ...paymentIntent,
    // 2026-10-07T12:00:00Z
    created: 1791374400,
    application_fee_amount: 3000,
    ...overrides,
  }) as unknown as Stripe.PaymentIntent;

const recorded: OwnedPaymentIntent = {
  sessionId: paymentIntent.metadata.sessionId,
  flowId: FLOW_ID,
  flowName: FLOW_NAME,
  teamSlug: TEAM_SLUG,
  teamName: TEAM_NAME,
};

const mockCheckoutSessions = (sessions: unknown[]) =>
  vi
    .spyOn(stripe.checkout.sessions, "list")
    .mockResolvedValue({ data: sessions } as unknown as Awaited<
      ReturnType<typeof stripe.checkout.sessions.list>
    >);

const sentTemplates = () =>
  vi.mocked(sendEmail).mock.calls.map(([template]) => template);

describe("buildCouncilEmailHeader", () => {
  it("renders the councils logo", () => {
    expect(
      buildCouncilEmailHeader("Southwark", {
        logo: "https://example.com/logo.png",
        primaryColour: "#000",
      }),
    ).toBe(
      '<img src="https://example.com/logo.png" alt="Southwark" height="40" />',
    );
  });

  it("falls back to the council name as text", () => {
    expect(
      buildCouncilEmailHeader("Southwark", {
        logo: null,
        primaryColour: "#000",
      }),
    ).toBe("Southwark");
    expect(buildCouncilEmailHeader("Southwark", null)).toBe("Southwark");
  });

  it("escapes values interpolated into HTML", () => {
    expect(
      buildCouncilEmailHeader('Barking & "Dagenham"', {
        logo: 'https://example.com/a.png" onerror="alert(1)',
        primaryColour: "#000",
      }),
    ).toBe(
      '<img src="https://example.com/a.png&quot; onerror=&quot;alert(1)" alt="Barking &amp; &quot;Dagenham&quot;" height="40" />',
    );
  });
});

describe("sendVatInvoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateVatInvoicePdf).mockResolvedValue(PDF);
    vi.mocked(sendEmail).mockResolvedValue({ message: "sent" });
    mockCheckoutSessions([
      { id: CHECKOUT_SESSION_ID, customer_details: { email: CUSTOMER_EMAIL } },
    ]);
    mockChargedFeeBreakdown(
      mockFeeBreakdown({
        payable: 145,
        serviceCharge: 25,
        serviceChargeVAT: 5,
      }),
    );
    mockCouncilInvoiceDetails();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("looks up the payer's email from the Checkout Session", async () => {
    await sendVatInvoices(succeededPaymentIntent(), recorded);

    expect(stripe.checkout.sessions.list).toHaveBeenCalledWith({
      payment_intent: "pi_test_123",
      limit: 1,
    });
  });

  it("sends separate council and PlanX invoices", async () => {
    await sendVatInvoices(succeededPaymentIntent(), recorded);

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(
      "vat-invoice-council-2",
      CUSTOMER_EMAIL,
      {
        serviceName: FLOW_NAME,
        invoiceNumber: "pi_test_123",
        amount: "£115.00",
        paymentDate: "7 October 2026",
        councilName: "London Borough of Southwark",
        header:
          '<img src="https://example.com/logo.png" alt="London Borough of Southwark" height="40" />',
        primaryColour: "#000",
      },
      {
        idempotencyKey: "vat-invoice-council-pi_test_123",
        attachments: [
          { filename: "invoice-council-pi_test_123.pdf", content: PDF },
        ],
      },
    );
    expect(sendEmail).toHaveBeenCalledWith(
      "vat-invoice-planx",
      CUSTOMER_EMAIL,
      {
        serviceName: FLOW_NAME,
        invoiceNumber: "pi_test_123",
        amount: "£30.00",
        paymentDate: "7 October 2026",
      },
      {
        idempotencyKey: "vat-invoice-planx-pi_test_123",
        attachments: [
          { filename: "invoice-planx-pi_test_123.pdf", content: PDF },
        ],
      },
    );
  });

  it("falls back to the council name in the email header when they have no logo", async () => {
    mockCouncilInvoiceDetails({
      theme: { logo: null, primaryColour: "#000" },
    });

    await sendVatInvoices(succeededPaymentIntent(), recorded);

    expect(sendEmail).toHaveBeenCalledWith(
      "vat-invoice-council-2",
      CUSTOMER_EMAIL,
      expect.objectContaining({ header: "London Borough of Southwark" }),
      expect.anything(),
    );
  });

  it("falls back to the default primary colour in the email when the council's is invalid", async () => {
    mockCouncilInvoiceDetails({
      theme: { logo: null, primaryColour: "red; } body { display: none" },
    });

    await sendVatInvoices(succeededPaymentIntent(), recorded);

    expect(sendEmail).toHaveBeenCalledWith(
      "vat-invoice-council-2",
      CUSTOMER_EMAIL,
      expect.objectContaining({ primaryColour: "#0010A4" }),
      expect.anything(),
    );
  });

  it("generates each PDF with the correct seller", async () => {
    await sendVatInvoices(succeededPaymentIntent(), recorded);

    const sellers = vi
      .mocked(generateVatInvoicePdf)
      .mock.calls.map(([invoice]) => [invoice.issuer, invoice.seller.name]);

    expect(sellers).toEqual([
      ["council", "London Borough of Southwark"],
      ["planx", "Open Systems Lab"],
    ]);
  });

  it("only sends the council invoice when no service charge was taken", async () => {
    mockChargedFeeBreakdown(mockFeeBreakdown({ payable: 145 }));

    await sendVatInvoices(
      succeededPaymentIntent({ application_fee_amount: null }),
      recorded,
    );

    expect(sentTemplates()).toEqual(["vat-invoice-council-2"]);
  });

  it("still sends the PlanX invoice when the council has no invoice details", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockCouncilInvoiceDetails({ invoiceDetails: null });

    await sendVatInvoices(succeededPaymentIntent(), recorded);

    expect(sentTemplates()).toEqual(["vat-invoice-planx"]);
    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ teamSlug: TEAM_SLUG }),
      }),
    );
  });

  it("does not fetch council details when the council has no portion", async () => {
    mockChargedFeeBreakdown(
      mockFeeBreakdown({
        payable: 30,
        serviceCharge: 25,
        serviceChargeVAT: 5,
      }),
    );

    await sendVatInvoices(succeededPaymentIntent({ amount: 3000 }), recorded);

    expect(
      queryMock.getCalls().find(({ id }) => id === "GetCouncilInvoiceDetails"),
    ).toBeUndefined();
    expect(sentTemplates()).toEqual(["vat-invoice-planx"]);
  });

  it("includes VAT on a discretionary application fee in the council invoice", async () => {
    mockChargedFeeBreakdown(
      mockFeeBreakdown({
        calculated: 100,
        calculatedVAT: 20,
        payable: 120,
        payableVAT: 20,
      }),
    );

    await sendVatInvoices(
      succeededPaymentIntent({ amount: 12000, application_fee_amount: null }),
      recorded,
    );

    const [[invoice]] = vi.mocked(generateVatInvoicePdf).mock.calls;
    expect(invoice.lineItems).toEqual([
      { description: "Application fee", net: 10000, vat: 2000, total: 12000 },
    ]);
    expect(invoice.totals).toEqual({ net: 10000, vat: 2000, total: 12000 });
  });

  it("skips invoicing a session with a legacy payment processing fee", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockChargedFeeBreakdown(
      mockFeeBreakdown({
        payable: 146.2,
        serviceCharge: 25,
        serviceChargeVAT: 5,
        paymentProcessing: 1,
        paymentProcessingVAT: 0.2,
      }),
    );

    await sendVatInvoices(succeededPaymentIntent({ amount: 14620 }), recorded);

    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("legacy payment processing fee"),
      }),
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("reports an error without throwing when a line has a negative net amount", async () => {
    vi.spyOn(payHelpers, "reportError");
    // The application fee remainder (£10) is less than its VAT (£20)
    mockChargedFeeBreakdown(
      mockFeeBreakdown({
        calculated: 100,
        calculatedVAT: 20,
        payable: 130,
        fastTrack: 100,
        fastTrackVAT: 20,
      }),
    );

    await sendVatInvoices(
      succeededPaymentIntent({ amount: 13000, application_fee_amount: null }),
      recorded,
    );

    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("fee breakdown is inconsistent"),
      }),
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("invoices the fee breakdown recorded for the Checkout Session", async () => {
    await sendVatInvoices(succeededPaymentIntent(), recorded);

    const call = queryMock
      .getCalls()
      .find(({ id }) => id === "GetChargedFeeBreakdown");
    expect(call?.variables).toEqual({
      sessionId: paymentIntent.metadata.sessionId,
      checkoutSessionId: CHECKOUT_SESSION_ID,
    });
  });

  it("reports an error without throwing when no fee breakdown was recorded for the Checkout Session", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockChargedFeeBreakdown(null);

    await expect(
      sendVatInvoices(succeededPaymentIntent(), recorded),
    ).resolves.toBeUndefined();

    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("no fee breakdown recorded"),
        context: expect.objectContaining({
          checkoutSessionId: CHECKOUT_SESSION_ID,
        }),
      }),
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("reports an error without throwing when the payer has no email", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockCheckoutSessions([{ customer_details: null }]);

    await expect(
      sendVatInvoices(succeededPaymentIntent(), recorded),
    ).resolves.toBeUndefined();

    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ paymentIntentId: "pi_test_123" }),
      }),
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("reports an error without throwing when no Checkout Session is found", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockCheckoutSessions([]);

    await sendVatInvoices(succeededPaymentIntent(), recorded);

    expect(payHelpers.reportError).toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("throws when PDF generation fails", async () => {
    vi.mocked(generateVatInvoicePdf).mockRejectedValue(new Error("boom"));

    await expect(
      sendVatInvoices(succeededPaymentIntent(), recorded),
    ).rejects.toThrow("boom");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("throws when sending an email fails", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("Resend is down"));

    await expect(
      sendVatInvoices(succeededPaymentIntent(), recorded),
    ).rejects.toThrow("Resend is down");
  });
});
