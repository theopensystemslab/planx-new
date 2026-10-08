import type Stripe from "stripe";

import { sendEmail } from "../../../../lib/resend/index.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
import { stripe } from "../../client.js";
import type { RecordedPaymentIntent } from "../paymentStatus/service.js";
import {
  FLOW_ID,
  FLOW_NAME,
  mockCouncilInvoiceDetails,
  mockFeeBreakdown,
  paymentIntent,
  TEAM_NAME,
  TEAM_SLUG,
} from "../test/mocks.js";
import { generateVatInvoicePdf } from "./pdf.js";
import { sendVatInvoices } from "./service.js";

vi.mock("../../../../lib/resend/index.js", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("./pdf.js", () => ({
  generateVatInvoicePdf: vi.fn(),
}));

const PDF = Buffer.from("%PDF-test");
const CUSTOMER_EMAIL = "payer@example.com";

// £145 total, of which £30 is the PlanX service charge (inc. £5 VAT)
const succeededPaymentIntent = (overrides: Record<string, unknown> = {}) =>
  ({
    ...paymentIntent,
    // 2026-10-07T12:00:00Z
    created: 1791374400,
    application_fee_amount: 3000,
    ...overrides,
  }) as unknown as Stripe.PaymentIntent;

const recorded = (
  overrides: Partial<RecordedPaymentIntent> = {},
): RecordedPaymentIntent => ({
  sessionId: paymentIntent.metadata.sessionId,
  flowId: FLOW_ID,
  flowName: FLOW_NAME,
  teamSlug: TEAM_SLUG,
  teamName: TEAM_NAME,
  feeBreakdown: mockFeeBreakdown({
    payable: 145,
    serviceCharge: 25,
    serviceChargeVAT: 5,
  }),
  ...overrides,
});

const mockCheckoutSessions = (sessions: unknown[]) =>
  vi
    .spyOn(stripe.checkout.sessions, "list")
    .mockResolvedValue({ data: sessions } as unknown as Awaited<
      ReturnType<typeof stripe.checkout.sessions.list>
    >);

const sentTemplates = () =>
  vi.mocked(sendEmail).mock.calls.map(([template]) => template);

describe("sendVatInvoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateVatInvoicePdf).mockResolvedValue(PDF);
    vi.mocked(sendEmail).mockResolvedValue({ message: "sent" });
    mockCheckoutSessions([{ customer_details: { email: CUSTOMER_EMAIL } }]);
    mockCouncilInvoiceDetails();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("when disabled", () => {
    it("does nothing", async () => {
      await sendVatInvoices(succeededPaymentIntent(), recorded());

      expect(stripe.checkout.sessions.list).not.toHaveBeenCalled();
      expect(generateVatInvoicePdf).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe("when enabled", () => {
    beforeEach(() => vi.stubEnv("STRIPE_VAT_INVOICES_ENABLED", "true"));

    it("looks up the payer's email from the Checkout Session", async () => {
      await sendVatInvoices(succeededPaymentIntent(), recorded());

      expect(stripe.checkout.sessions.list).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        limit: 1,
      });
    });

    it("sends separate council and PlanX invoices", async () => {
      await sendVatInvoices(succeededPaymentIntent(), recorded());

      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(sendEmail).toHaveBeenCalledWith(
        "vat-invoice-council",
        CUSTOMER_EMAIL,
        {
          serviceName: FLOW_NAME,
          invoiceNumber: "pi_test_123",
          amount: "£115.00",
          paymentDate: "7 October 2026",
          councilName: "London Borough of Southwark",
          logo: "https://example.com/logo.png",
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

    it("generates each PDF with the correct seller", async () => {
      await sendVatInvoices(succeededPaymentIntent(), recorded());

      const sellers = vi
        .mocked(generateVatInvoicePdf)
        .mock.calls.map(([invoice]) => [invoice.issuer, invoice.seller.name]);

      expect(sellers).toEqual([
        ["council", "London Borough of Southwark"],
        ["planx", "Open Systems Lab"],
      ]);
    });

    it("only sends the council invoice when no service charge was taken", async () => {
      await sendVatInvoices(
        succeededPaymentIntent({ application_fee_amount: null }),
        recorded({ feeBreakdown: mockFeeBreakdown({ payable: 145 }) }),
      );

      expect(sentTemplates()).toEqual(["vat-invoice-council"]);
    });

    it("still sends the PlanX invoice when the council has no invoice details", async () => {
      vi.spyOn(payHelpers, "reportError");
      mockCouncilInvoiceDetails({ invoiceDetails: null });

      await sendVatInvoices(succeededPaymentIntent(), recorded());

      expect(sentTemplates()).toEqual(["vat-invoice-planx"]);
      expect(payHelpers.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({ teamSlug: TEAM_SLUG }),
        }),
      );
    });

    it("does not fetch council details when the council has no portion", async () => {
      await sendVatInvoices(
        succeededPaymentIntent({ amount: 3000 }),
        recorded({
          feeBreakdown: mockFeeBreakdown({
            payable: 30,
            serviceCharge: 25,
            serviceChargeVAT: 5,
          }),
        }),
      );

      expect(
        queryMock
          .getCalls()
          .find(({ id }) => id === "GetCouncilInvoiceDetails"),
      ).toBeUndefined();
      expect(sentTemplates()).toEqual(["vat-invoice-planx"]);
    });

    it("includes VAT on a discretionary application fee in the council invoice", async () => {
      await sendVatInvoices(
        succeededPaymentIntent({ amount: 12000, application_fee_amount: null }),
        recorded({
          feeBreakdown: mockFeeBreakdown({
            calculated: 100,
            calculatedVAT: 20,
            payable: 120,
            payableVAT: 20,
          }),
        }),
      );

      const [[invoice]] = vi.mocked(generateVatInvoicePdf).mock.calls;
      expect(invoice.lineItems).toEqual([
        { description: "Application fee", net: 10000, vat: 2000, total: 12000 },
      ]);
      expect(invoice.totals).toEqual({ net: 10000, vat: 2000, total: 12000 });
    });

    it.each([
      ["total amount", { amount: 99999 }],
      ["PlanX's share", { application_fee_amount: 1234 }],
    ])(
      "reports an error without throwing when the %s charged by Stripe does not match the fee breakdown",
      async (_label, overrides) => {
        vi.spyOn(payHelpers, "reportError");

        await sendVatInvoices(succeededPaymentIntent(overrides), recorded());

        expect(payHelpers.reportError).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.stringContaining("does not match"),
          }),
        );
        expect(sendEmail).not.toHaveBeenCalled();
      },
    );

    it("skips invoicing a session with a legacy payment processing fee", async () => {
      vi.spyOn(payHelpers, "reportError");

      await sendVatInvoices(
        succeededPaymentIntent({ amount: 14620 }),
        recorded({
          feeBreakdown: mockFeeBreakdown({
            payable: 146.2,
            serviceCharge: 25,
            serviceChargeVAT: 5,
            paymentProcessing: 1,
            paymentProcessingVAT: 0.2,
          }),
        }),
      );

      expect(payHelpers.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("legacy payment processing fee"),
        }),
      );
      expect(stripe.checkout.sessions.list).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("reports an error without throwing when a line has a negative net amount", async () => {
      vi.spyOn(payHelpers, "reportError");

      await sendVatInvoices(
        succeededPaymentIntent({ amount: 13000, application_fee_amount: null }),
        recorded({
          // The application fee remainder (£10) is less than its VAT (£20)
          feeBreakdown: mockFeeBreakdown({
            calculated: 100,
            calculatedVAT: 20,
            payable: 130,
            fastTrack: 100,
            fastTrackVAT: 20,
          }),
        }),
      );

      expect(payHelpers.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("fee breakdown is inconsistent"),
        }),
      );
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("reports an error without throwing when there is no fee breakdown", async () => {
      vi.spyOn(payHelpers, "reportError");

      await expect(
        sendVatInvoices(
          succeededPaymentIntent(),
          recorded({ feeBreakdown: null }),
        ),
      ).resolves.toBeUndefined();

      expect(payHelpers.reportError).toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("reports an error without throwing when the payer has no email", async () => {
      vi.spyOn(payHelpers, "reportError");
      mockCheckoutSessions([{ customer_details: null }]);

      await expect(
        sendVatInvoices(succeededPaymentIntent(), recorded()),
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

      await sendVatInvoices(succeededPaymentIntent(), recorded());

      expect(payHelpers.reportError).toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("throws when PDF generation fails", async () => {
      vi.mocked(generateVatInvoicePdf).mockRejectedValue(new Error("boom"));

      await expect(
        sendVatInvoices(succeededPaymentIntent(), recorded()),
      ).rejects.toThrow("boom");
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("throws when sending an email fails", async () => {
      vi.mocked(sendEmail).mockRejectedValue(new Error("Resend is down"));

      await expect(
        sendVatInvoices(succeededPaymentIntent(), recorded()),
      ).rejects.toThrow("Resend is down");
    });
  });
});
