import type Stripe from "stripe";

import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
import { stripe } from "../../client.js";
import type { PaymentSession } from "../ownership/service.js";
import {
  FLOW_ID,
  FLOW_NAME,
  mockChargedFeeBreakdown,
  mockCouncilInvoiceDetails,
  mockFeeBreakdown,
  paymentIntent,
  TEAM_ID,
  TEAM_NAME,
  TEAM_SLUG,
} from "../test/mocks.js";
import { generateVatInvoicePdf } from "./pdf.js";
import { createInvoices } from "./service.js";
import type { ReserveInvoiceArgs, StoredInvoice } from "./storage.js";
import { reserveInvoice, storeInvoicePdf } from "./storage.js";

vi.mock("./pdf.js", () => ({
  generateVatInvoicePdf: vi.fn(),
}));

vi.mock("./storage.js", () => ({
  reserveInvoice: vi.fn(),
  storeInvoicePdf: vi.fn(),
}));

const PDF = Buffer.from("%PDF-test");
const CUSTOMER_EMAIL = "payer@example.com";
const CHECKOUT_SESSION_ID = "cs_test_123";
const SUCCEEDED_AT = "2026-10-12T09:30:00+00:00";

// £145 total, of which £30 is the PlanX service charge (inc. £5 VAT)
const succeededPaymentIntent = (overrides: Record<string, unknown> = {}) =>
  ({
    ...paymentIntent,
    // 2026-10-07T12:00:00Z
    created: 1791374400,
    application_fee_amount: 3000,
    ...overrides,
  }) as unknown as Stripe.PaymentIntent;

const recorded: PaymentSession = {
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

const mockSucceededAt = (createdAt: string | null) =>
  queryMock.mockQuery({
    name: "GetPaymentSucceededAt",
    matchOnVariables: false,
    data: { paymentStatus: createdAt ? [{ createdAt }] : [] },
  });

/** The invoices passed to the PDF renderer, in order */
const renderedInvoices = () =>
  vi.mocked(generateVatInvoicePdf).mock.calls.map(([invoice]) => invoice);

const storedKinds = () =>
  vi.mocked(storeInvoicePdf).mock.calls.map(([{ kind }]) => kind);

const INVOICE_NUMBERS = {
  payer_invoice: "PX-2026-INV-SWK-00003",
  council_invoice: "OSL-2026-INV-SWK-00002",
};

/** As recorded by reserveInvoice(), with its allocated number */
const reservedInvoice = (
  { issuedAt, ...args }: ReserveInvoiceArgs,
  fileKey: string | null = null,
): StoredInvoice => ({
  ...args,
  id: `${args.kind}-id`,
  invoiceNumber: INVOICE_NUMBERS[args.kind],
  issuedAt: issuedAt.toISOString(),
  fileKey,
});

describe("createInvoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateVatInvoicePdf).mockResolvedValue(PDF);
    vi.mocked(reserveInvoice).mockImplementation(async (args) =>
      reservedInvoice(args),
    );
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
    mockSucceededAt(SUCCEEDED_AT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("looks up the payer's details from the Checkout Session", async () => {
    await createInvoices(succeededPaymentIntent(), recorded);

    expect(stripe.checkout.sessions.list).toHaveBeenCalledWith({
      payment_intent: "pi_test_123",
      limit: 1,
    });
  });

  it("records a customer invoice for every line, and a council invoice for the service charge", async () => {
    await createInvoices(succeededPaymentIntent(), recorded);

    expect(reserveInvoice).toHaveBeenCalledTimes(2);
    expect(reserveInvoice).toHaveBeenCalledWith({
      kind: "payer_invoice",
      stripePaymentIntentId: "pi_test_123",
      sessionId: recorded.sessionId,
      flowId: FLOW_ID,
      teamId: TEAM_ID,
      issuedAt: new Date(SUCCEEDED_AT),
      net: 14000,
      vat: 500,
      total: 14500,
    });
    expect(reserveInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "council_invoice",
        net: 2500,
        vat: 500,
        total: 3000,
      }),
    );
  });

  it("renders each invoice with its allocated number, then stores its PDF", async () => {
    await createInvoices(succeededPaymentIntent(), recorded);

    expect(
      renderedInvoices().map(({ invoiceNumber }) => invoiceNumber),
    ).toEqual(["PX-2026-INV-SWK-00003", "OSL-2026-INV-SWK-00002"]);
    expect(storeInvoicePdf).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "payer_invoice-id",
        invoiceNumber: "PX-2026-INV-SWK-00003",
      }),
      TEAM_SLUG,
      PDF,
    );
    expect(storedKinds()).toEqual(["payer_invoice", "council_invoice"]);
  });

  it("renders the customer invoice from the council to the payer, and the council invoice from OSL to the council", async () => {
    await createInvoices(succeededPaymentIntent(), recorded);

    expect(
      renderedInvoices().map(
        ({ kind, seller, branding, customer, lineItems }) => ({
          kind,
          seller: seller.name,
          branding,
          customer: customer.name,
          lines: lineItems.map(({ description }) => description),
        }),
      ),
    ).toEqual([
      {
        kind: "payer_invoice",
        seller: "London Borough of Southwark",
        branding: {
          logo: "https://example.com/logo.png",
          primaryColour: "#000",
        },
        customer: null,
        lines: ["Application fee", "PlanX service charge"],
      },
      {
        kind: "council_invoice",
        seller: "Open Systems Lab",
        branding: null,
        customer: "London Borough of Southwark",
        lines: ["PlanX service charge"],
      },
    ]);
  });

  it("bills the council using its invoice details", async () => {
    await createInvoices(succeededPaymentIntent(), recorded);

    expect(renderedInvoices()[1].customer).toEqual({
      name: "London Borough of Southwark",
      addressLines: ["160 Tooley Street", "London", "SE1 2QH"],
      email: "planning@southwark.gov.uk",
    });
  });

  it("bills the payer using their details from Checkout", async () => {
    mockCheckoutSessions([
      {
        id: CHECKOUT_SESSION_ID,
        customer_details: {
          email: CUSTOMER_EMAIL,
          name: "Jo Bloggs",
          address: { line1: "1 High Street", postal_code: "SE1 2QH" },
        },
      },
    ]);

    await createInvoices(succeededPaymentIntent(), recorded);

    expect(renderedInvoices()[0].customer).toEqual({
      email: CUSTOMER_EMAIL,
      name: "Jo Bloggs",
      addressLines: ["1 High Street", "SE1 2QH"],
    });
  });

  it("dates the invoices from when the payment succeeded", async () => {
    await createInvoices(succeededPaymentIntent(), recorded);

    expect(renderedInvoices()[0].issuedAt).toEqual(new Date(SUCCEEDED_AT));
  });

  it("falls back to when the PaymentIntent was created if no succeeded row is found", async () => {
    mockSucceededAt(null);

    await createInvoices(succeededPaymentIntent(), recorded);

    expect(renderedInvoices()[0].issuedAt).toEqual(
      new Date("2026-10-07T12:00:00Z"),
    );
  });

  it("skips invoices whose PDF has already been stored, so a retry only creates what's missing", async () => {
    vi.mocked(reserveInvoice).mockImplementation(async (args) =>
      reservedInvoice(
        args,
        args.kind === "payer_invoice"
          ? "invoices/pi_test_123/payer_invoice.pdf"
          : null,
      ),
    );

    await createInvoices(succeededPaymentIntent(), recorded);

    expect(renderedInvoices().map(({ kind }) => kind)).toEqual([
      "council_invoice",
    ]);
    expect(storedKinds()).toEqual(["council_invoice"]);
  });

  it("only stores a customer invoice when there's VAT but no service charge", async () => {
    mockChargedFeeBreakdown(
      mockFeeBreakdown({
        calculated: 100,
        calculatedVAT: 20,
        payable: 120,
        payableVAT: 20,
      }),
    );

    await createInvoices(
      succeededPaymentIntent({ amount: 12000, application_fee_amount: null }),
      recorded,
    );

    expect(storedKinds()).toEqual(["payer_invoice"]);
  });

  it("stores no invoices when there's no VAT or service charge", async () => {
    mockChargedFeeBreakdown(mockFeeBreakdown({ payable: 115 }));

    await createInvoices(
      succeededPaymentIntent({ amount: 11500, application_fee_amount: null }),
      recorded,
    );

    expect(generateVatInvoicePdf).not.toHaveBeenCalled();
    expect(reserveInvoice).not.toHaveBeenCalled();
  });

  it("uses the team name, and reports an error, when the council has no invoice details", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockCouncilInvoiceDetails({ invoiceDetails: null });

    await createInvoices(succeededPaymentIntent(), recorded);

    expect(
      renderedInvoices().map(({ seller, customer }) => [
        seller.name,
        customer.name,
      ]),
    ).toEqual([
      [TEAM_NAME, null],
      ["Open Systems Lab", TEAM_NAME],
    ]);
    expect(storedKinds()).toEqual(["payer_invoice", "council_invoice"]);
    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ teamSlug: TEAM_SLUG }),
      }),
    );
  });

  it("includes VAT on a discretionary application fee", async () => {
    mockChargedFeeBreakdown(
      mockFeeBreakdown({
        calculated: 100,
        calculatedVAT: 20,
        payable: 120,
        payableVAT: 20,
      }),
    );

    await createInvoices(
      succeededPaymentIntent({ amount: 12000, application_fee_amount: null }),
      recorded,
    );

    const [payerInvoice] = renderedInvoices();
    expect(payerInvoice.lineItems).toEqual([
      {
        description: "Application fee",
        net: 10000,
        vat: 2000,
        total: 12000,
        vatRate: 20,
      },
    ]);
    expect(payerInvoice.vatSummary).toEqual([
      { rate: 20, net: 10000, vat: 2000 },
    ]);
  });

  it("invoices the fee breakdown recorded for the Checkout Session", async () => {
    await createInvoices(succeededPaymentIntent(), recorded);

    const call = queryMock
      .getCalls()
      .find(({ id }) => id === "GetChargedFeeBreakdown");
    expect(call?.variables).toEqual({
      sessionId: paymentIntent.metadata.sessionId,
      checkoutSessionId: CHECKOUT_SESSION_ID,
    });
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

    await createInvoices(succeededPaymentIntent({ amount: 14620 }), recorded);

    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("legacy payment processing fee"),
      }),
    );
    expect(reserveInvoice).not.toHaveBeenCalled();
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

    await createInvoices(
      succeededPaymentIntent({ amount: 13000, application_fee_amount: null }),
      recorded,
    );

    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("fee breakdown is inconsistent"),
      }),
    );
    expect(reserveInvoice).not.toHaveBeenCalled();
  });

  it("reports an error without throwing when no fee breakdown was recorded for the Checkout Session", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockChargedFeeBreakdown(null);

    await expect(
      createInvoices(succeededPaymentIntent(), recorded),
    ).resolves.toBeUndefined();

    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("no fee breakdown recorded"),
        context: expect.objectContaining({
          checkoutSessionId: CHECKOUT_SESSION_ID,
        }),
      }),
    );
    expect(reserveInvoice).not.toHaveBeenCalled();
  });

  it("reports an error without throwing when the payer has no email", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockCheckoutSessions([{ customer_details: null }]);

    await expect(
      createInvoices(succeededPaymentIntent(), recorded),
    ).resolves.toBeUndefined();

    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ paymentIntentId: "pi_test_123" }),
      }),
    );
    expect(reserveInvoice).not.toHaveBeenCalled();
  });

  it("reports an error without throwing when no Checkout Session is found", async () => {
    vi.spyOn(payHelpers, "reportError");
    mockCheckoutSessions([]);

    await createInvoices(succeededPaymentIntent(), recorded);

    expect(payHelpers.reportError).toHaveBeenCalled();
    expect(reserveInvoice).not.toHaveBeenCalled();
  });

  it("throws when PDF generation fails", async () => {
    vi.mocked(generateVatInvoicePdf).mockRejectedValue(new Error("boom"));

    await expect(
      createInvoices(succeededPaymentIntent(), recorded),
    ).rejects.toThrow("boom");
    expect(storeInvoicePdf).not.toHaveBeenCalled();
  });

  it("throws when storing an invoice fails", async () => {
    vi.mocked(storeInvoicePdf).mockRejectedValue(new Error("S3 is down"));

    await expect(
      createInvoices(succeededPaymentIntent(), recorded),
    ).rejects.toThrow("S3 is down");
  });
});
