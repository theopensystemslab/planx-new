import type Stripe from "stripe";

import type * as resend from "../../../../lib/resend/index.js";
import { sendEmail } from "../../../../lib/resend/index.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
import { formatPaymentMethod } from "../../helpers.js";
import type { PaymentSession } from "../ownership/service.js";
import {
  FLOW_ID,
  FLOW_NAME,
  paymentIntent,
  TEAM_ID,
  TEAM_NAME,
  TEAM_SLUG,
} from "../test/mocks.js";
import { getCheckoutSession, getSucceededAt } from "../vatInvoice/service.js";
import type { StoredInvoice } from "../vatInvoice/storage.js";
import { getInvoicePdf, getStoredInvoices } from "../vatInvoice/storage.js";
import { formatSiteAddress, sendPaymentConfirmationEmails } from "./service.js";

vi.mock("../../../../lib/resend/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof resend>()),
  sendEmail: vi.fn(),
}));

vi.mock("../vatInvoice/service.js", () => ({
  getCheckoutSession: vi.fn(),
  getSucceededAt: vi.fn(),
}));

vi.mock("../vatInvoice/storage.js", () => ({
  getStoredInvoices: vi.fn(),
  getInvoicePdf: vi.fn(),
}));

const PAYER_EMAIL = "payer@example.com";

const recorded: PaymentSession = {
  sessionId: paymentIntent.metadata.sessionId,
  flowId: FLOW_ID,
  flowName: FLOW_NAME,
  teamSlug: TEAM_SLUG,
  teamName: TEAM_NAME,
  passportData: { _address: { title: "1 High Street, London" } },
};

const storedInvoice = (
  kind: StoredInvoice["kind"],
  invoiceNumber: string,
): StoredInvoice => ({
  id: `${kind}-id`,
  kind,
  stripePaymentIntentId: paymentIntent.id,
  sessionId: recorded.sessionId,
  flowId: FLOW_ID,
  teamId: TEAM_ID,
  invoiceNumber,
  issuedAt: "2026-10-12T09:30:00+00:00",
  net: 0,
  vat: 0,
  total: 0,
  fileKey: `invoices/${paymentIntent.id}/${kind}.pdf`,
});

const RECEIPT = storedInvoice("payer_invoice", "PX-2026-INV-SWK-00003");
const COUNCIL_INVOICE = storedInvoice(
  "council_invoice",
  "OSL-2026-INV-SWK-00002",
);

const pdfFor = (fileKey: string) => Buffer.from(`%PDF-${fileKey}`);

const mockCouncilEmailDetails = ({
  helpEmail = "help@southwark.gov.uk" as string | null,
  invoiceEmail = "finance@southwark.gov.uk" as string | null,
} = {}) =>
  queryMock.mockQuery({
    name: "GetCouncilEmailDetails",
    matchOnVariables: false,
    data: {
      teams: [
        {
          teamSettings: { helpEmail },
          invoiceDetails: { emailAddress: invoiceEmail },
          theme: {
            logo: "https://example.com/logo.png",
            primaryColour: "#000",
          },
        },
      ],
    },
  });

const sentEmail = (template: string) =>
  vi.mocked(sendEmail).mock.calls.find(([name]) => name === template);

const send = (paymentMethod: string | null = "card") =>
  sendPaymentConfirmationEmails(
    paymentIntent as unknown as Stripe.PaymentIntent,
    recorded,
    paymentMethod,
  );

describe("sendPaymentConfirmationEmails", () => {
  beforeEach(() => {
    vi.mocked(getCheckoutSession).mockResolvedValue({
      customer_details: { email: PAYER_EMAIL },
    } as Stripe.Checkout.Session);
    vi.mocked(getSucceededAt).mockResolvedValue(
      new Date("2026-10-12T09:30:00Z"),
    );
    vi.mocked(getStoredInvoices).mockResolvedValue([RECEIPT, COUNCIL_INVOICE]);
    vi.mocked(getInvoicePdf).mockImplementation(async (fileKey) =>
      pdfFor(fileKey),
    );
    mockCouncilEmailDetails();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("payer", () => {
    it("sends a council-branded payment confirmation from Local Planning Services, replying to the council", async () => {
      await send();

      expect(sendEmail).toHaveBeenCalledWith(
        "payment-confirmed-payer",
        PAYER_EMAIL,
        {
          serviceName: FLOW_NAME,
          councilName: TEAM_NAME,
          sessionId: recorded.sessionId,
          paymentReference: paymentIntent.id,
          amount: "£145.00",
          paymentDate: "12 October 2026",
          councilLogo: "https://example.com/logo.png",
          councilPrimaryColour: "#000",
        },
        expect.objectContaining({
          idempotencyKey: `payment-confirmed-payer-${paymentIntent.id}`,
          from: `${TEAM_NAME} <noreply@notifications.localplanning.services>`,
          replyTo: "help@southwark.gov.uk",
        }),
      );
    });

    it("attaches only their VAT receipt", async () => {
      await send();

      expect(sentEmail("payment-confirmed-payer")?.[3]?.attachments).toEqual([
        {
          filename: "PX-2026-INV-SWK-00003.pdf",
          content: pdfFor(RECEIPT.fileKey!),
        },
      ]);
    });

    it("is still sent, without an attachment, when the payment has no VAT receipt", async () => {
      vi.mocked(getStoredInvoices).mockResolvedValue([]);

      await send();

      expect(sentEmail("payment-confirmed-payer")?.[3]?.attachments).toBe(
        undefined,
      );
    });

    it("reports an error, and still emails the council, when there's no payer email", async () => {
      vi.spyOn(payHelpers, "reportError");
      vi.mocked(getCheckoutSession).mockResolvedValue(null);

      await send();

      expect(payHelpers.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("no payer email"),
        }),
      );
      expect(sentEmail("payment-confirmed-payer")).toBeUndefined();
      expect(sentEmail("payment-confirmed-council")).toBeDefined();
    });
  });

  describe("council", () => {
    it("sends a payment confirmation to the invoice email address, with every VAT document attached", async () => {
      await send();

      expect(sendEmail).toHaveBeenCalledWith(
        "payment-confirmed-council",
        "finance@southwark.gov.uk",
        {
          serviceName: FLOW_NAME,
          councilName: TEAM_NAME,
          sessionId: recorded.sessionId,
          address: "1 High Street, London",
          paymentReference: paymentIntent.id,
          paymentMethod: "Card",
          amount: "£145.00",
          paymentDate: "12 October 2026",
        },
        {
          idempotencyKey: `payment-confirmed-council-${paymentIntent.id}`,
          attachments: [
            {
              filename: "PX-2026-INV-SWK-00003.pdf",
              content: pdfFor(RECEIPT.fileKey!),
            },
            {
              filename: "OSL-2026-INV-SWK-00002.pdf",
              content: pdfFor(COUNCIL_INVOICE.fileKey!),
            },
          ],
        },
      );
    });

    it("includes the site address and the payment method used", async () => {
      await sendPaymentConfirmationEmails(
        paymentIntent as unknown as Stripe.PaymentIntent,
        {
          ...recorded,
          passportData: {
            _address: { single_line_address: "1 High Street, London" },
          },
        },
        "pay_by_bank",
      );

      expect(sentEmail("payment-confirmed-council")?.[2]).toEqual(
        expect.objectContaining({
          address: "1 High Street, London",
          paymentMethod: "Pay by bank",
        }),
      );
    });

    it("falls back to placeholders when the address and payment method are unknown", async () => {
      await sendPaymentConfirmationEmails(
        paymentIntent as unknown as Stripe.PaymentIntent,
        { ...recorded, passportData: {} },
        null,
      );

      expect(sentEmail("payment-confirmed-council")?.[2]).toEqual(
        expect.objectContaining({
          address: "Address not submitted",
          paymentMethod: "Unknown",
        }),
      );
    });

    it("is still sent, without attachments, when the payment has no VAT documents", async () => {
      vi.mocked(getStoredInvoices).mockResolvedValue([]);

      await send();

      expect(sentEmail("payment-confirmed-council")?.[3]?.attachments).toBe(
        undefined,
      );
    });

    it("reports an error without throwing when the council has no invoice email address", async () => {
      vi.spyOn(payHelpers, "reportError");
      mockCouncilEmailDetails({ invoiceEmail: null });

      await expect(send()).resolves.toBeUndefined();

      expect(payHelpers.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("no invoice email address"),
          context: expect.objectContaining({ teamSlug: TEAM_SLUG }),
        }),
      );
      expect(sentEmail("payment-confirmed-council")).toBeUndefined();
    });

    it("sends the same confirmation for a delayed payment (Bacs), as it's only submitted once paid", async () => {
      await send("bacs_debit");

      expect(sentEmail("payment-confirmed-council")?.[2]).toEqual(
        expect.objectContaining({ paymentMethod: "Bacs Direct Debit" }),
      );
    });
  });

  it("throws when an email fails to send, so Hasura retries the event", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("Resend is down"));

    await expect(send()).rejects.toThrow("Resend is down");
  });

  describe("formatPaymentMethod", () => {
    it.each([
      ["card", "Card"],
      ["pay_by_bank", "Pay by bank"],
      ["bacs_debit", "Bacs Direct Debit"],
      ["sepa_debit", "sepa debit"],
      [null, "Unknown"],
    ] as const)("formats %s as '%s'", (type, label) => {
      expect(formatPaymentMethod(type)).toBe(label);
    });
  });

  describe("formatSiteAddress", () => {
    it("prefers the single line address, then the title", () => {
      expect(
        formatSiteAddress({
          _address: { single_line_address: "1 High St", title: "1, High St" },
        }),
      ).toBe("1 High St");
      expect(formatSiteAddress({ _address: { title: "1, High St" } })).toBe(
        "1, High St",
      );
    });

    it("falls back to a placeholder when there's no address", () => {
      expect(formatSiteAddress(undefined)).toBe("Address not submitted");
      expect(formatSiteAddress({})).toBe("Address not submitted");
    });
  });

  it("throws when a stored invoice has no PDF", async () => {
    vi.mocked(getStoredInvoices).mockResolvedValue([
      { ...RECEIPT, fileKey: null },
    ]);

    await expect(send()).rejects.toThrow(
      "Invoice PX-2026-INV-SWK-00003 has no PDF stored",
    );
  });
});
