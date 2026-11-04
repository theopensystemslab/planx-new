import type Stripe from "stripe";

import { sendEmail } from "../../../../lib/resend/index.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
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
import { sendPaymentConfirmationEmails } from "./service.js";

vi.mock("../../../../lib/resend/index.js", () => ({
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

const send = () =>
  sendPaymentConfirmationEmails(
    paymentIntent as unknown as Stripe.PaymentIntent,
    recorded,
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
    it("sends a council-branded payment confirmation, replying to the council", async () => {
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
      expect(sentEmail("payment-invoices-council")).toBeDefined();
    });
  });

  describe("council", () => {
    it("sends a single email with every VAT document attached to the invoice email address", async () => {
      await send();

      expect(sendEmail).toHaveBeenCalledWith(
        "payment-invoices-council",
        "finance@southwark.gov.uk",
        expect.objectContaining({ paymentReference: paymentIntent.id }),
        {
          idempotencyKey: `payment-invoices-council-${paymentIntent.id}`,
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

    it("is not sent when the payment has no VAT documents", async () => {
      vi.mocked(getStoredInvoices).mockResolvedValue([]);

      await send();

      expect(sentEmail("payment-invoices-council")).toBeUndefined();
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
      expect(sentEmail("payment-invoices-council")).toBeUndefined();
    });
  });

  it("throws when an email fails to send, so Hasura retries the event", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("Resend is down"));

    await expect(send()).rejects.toThrow("Resend is down");
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
