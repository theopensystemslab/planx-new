import type Stripe from "stripe";

import type { FeeLine } from "../../feeLines.js";
import type { PaymentSession } from "../ownership/service.js";
import {
  FLOW_ID,
  FLOW_NAME,
  paymentIntent,
  TEAM_NAME,
  TEAM_SLUG,
} from "../test/mocks.js";
import {
  buildVatInvoiceData,
  getCouncilContactDetails,
  getInvoiceLineItems,
  getPayerContactDetails,
  getVatRate,
  isInvoiceRequired,
  summariseVat,
} from "./data.js";
import { PLANX_SELLER } from "./seller.js";

const feeLines: FeeLine[] = [
  {
    description: "Application fee",
    payee: "council",
    net: 10000,
    vat: 0,
    total: 10000,
  },
  {
    description: "Fast Track fee",
    payee: "council",
    net: 5000,
    vat: 1000,
    total: 6000,
  },
  {
    description: "PlanX service charge",
    payee: "planx",
    net: 2500,
    vat: 500,
    total: 3000,
  },
];

describe("getVatRate", () => {
  it.each([
    [{ net: 2500, vat: 500 }, 20],
    [{ net: 10000, vat: 0 }, 0],
    [{ net: 0, vat: 0 }, 0],
    // Rounded pence amounts still give a whole rate
    [{ net: 4167, vat: 833 }, 20],
  ])("derives the rate from %o", (line, rate) => {
    expect(getVatRate(line)).toBe(rate);
  });
});

describe("getInvoiceLineItems", () => {
  it("includes every line on the customer invoice", () => {
    expect(getInvoiceLineItems(feeLines, "payer_invoice")).toEqual([
      {
        description: "Application fee",
        net: 10000,
        vat: 0,
        total: 10000,
        vatRate: 0,
      },
      {
        description: "Fast Track fee",
        net: 5000,
        vat: 1000,
        total: 6000,
        vatRate: 20,
      },
      {
        description: "PlanX service charge",
        net: 2500,
        vat: 500,
        total: 3000,
        vatRate: 20,
      },
    ]);
  });

  it("only includes the service charge on the council invoice", () => {
    expect(
      getInvoiceLineItems(feeLines, "council_invoice").map(
        ({ description }) => description,
      ),
    ).toEqual(["PlanX service charge"]);
  });

  it("drops zero-value lines", () => {
    const lineItems = getInvoiceLineItems(
      [{ ...feeLines[0], net: 0, vat: 0, total: 0 }, feeLines[1]],
      "payer_invoice",
    );

    expect(lineItems.map(({ description }) => description)).toEqual([
      "Fast Track fee",
    ]);
  });
});

describe("isInvoiceRequired", () => {
  const [applicationFee, fastTrack, serviceCharge] = feeLines;

  it.each([
    ["a service charge", [applicationFee, serviceCharge], true, true],
    ["VAT on a council fee only", [applicationFee, fastTrack], true, false],
    ["no VAT or service charge", [applicationFee], false, false],
    [
      "a zero-value service charge",
      [applicationFee, { ...serviceCharge, net: 0, vat: 0, total: 0 }],
      false,
      false,
    ],
  ])("for a payment with %s", (_, lines, payerInvoice, councilInvoice) => {
    expect(isInvoiceRequired(lines, "payer_invoice")).toBe(payerInvoice);
    expect(isInvoiceRequired(lines, "council_invoice")).toBe(councilInvoice);
  });
});

describe("summariseVat", () => {
  it("totals the net and VAT amounts for each rate, highest rate first", () => {
    expect(
      summariseVat(getInvoiceLineItems(feeLines, "payer_invoice")),
    ).toEqual([
      { rate: 20, net: 7500, vat: 1500 },
      { rate: 0, net: 10000, vat: 0 },
    ]);
  });
});

describe("getPayerContactDetails", () => {
  it("includes the payer's name and address from Checkout", () => {
    expect(
      getPayerContactDetails("payer@example.com", {
        name: "Jo Bloggs",
        address: {
          line1: "1 High Street",
          line2: null,
          city: "London",
          state: null,
          postal_code: "SE1 2QH",
          country: "GB",
        },
      } as Stripe.Checkout.Session.CustomerDetails),
    ).toEqual({
      email: "payer@example.com",
      name: "Jo Bloggs",
      addressLines: ["1 High Street", "London", "SE1 2QH"],
    });
  });

  it("falls back to just the email when Checkout has no other details", () => {
    expect(getPayerContactDetails("payer@example.com", null)).toEqual({
      email: "payer@example.com",
      name: null,
      addressLines: [],
    });
  });
});

describe("getCouncilContactDetails", () => {
  it("bills the council using its invoice details", () => {
    expect(
      getCouncilContactDetails({
        name: "London Borough of Southwark",
        addressLines: ["160 Tooley Street", "London", "SE1 2QH"],
        vatNumber: "GB123456789",
        companyRegistration: null,
        email: "planning@southwark.gov.uk",
      }),
    ).toEqual({
      name: "London Borough of Southwark",
      addressLines: ["160 Tooley Street", "London", "SE1 2QH"],
      email: "planning@southwark.gov.uk",
    });
  });
});

describe("buildVatInvoiceData", () => {
  const recorded: PaymentSession = {
    sessionId: paymentIntent.metadata.sessionId,
    flowId: FLOW_ID,
    flowName: FLOW_NAME,
    teamSlug: TEAM_SLUG,
    teamName: TEAM_NAME,
  };

  const customer = {
    email: "payer@example.com",
    name: null,
    addressLines: [],
  };

  it("builds invoice data with totals and a VAT summary from the line items", () => {
    const lineItems = getInvoiceLineItems(feeLines, "payer_invoice");
    const issuedAt = new Date("2026-10-07T12:00:00Z");

    const invoice = buildVatInvoiceData({
      kind: "payer_invoice",
      invoiceNumber: "PX-2026-INV-BNE-00001",
      paymentIntent: paymentIntent as unknown as Stripe.PaymentIntent,
      recorded,
      issuedAt,
      customer,
      seller: PLANX_SELLER,
      branding: null,
      lineItems,
    });

    expect(invoice).toEqual({
      kind: "payer_invoice",
      isTest: true,
      invoiceNumber: "PX-2026-INV-BNE-00001",
      issuedAt,
      customer,
      sessionId: recorded.sessionId,
      paymentId: "pi_test_123",
      flowId: FLOW_ID,
      flowName: FLOW_NAME,
      teamSlug: TEAM_SLUG,
      teamName: TEAM_NAME,
      seller: PLANX_SELLER,
      branding: null,
      lineItems,
      totals: { net: 17500, vat: 1500, total: 19000 },
      vatSummary: [
        { rate: 20, net: 7500, vat: 1500 },
        { rate: 0, net: 10000, vat: 0 },
      ],
    });
  });

  it("is only a real invoice for a live mode payment", () => {
    const invoice = buildVatInvoiceData({
      kind: "payer_invoice",
      invoiceNumber: "PX-2026-INV-BNE-00001",
      paymentIntent: {
        ...paymentIntent,
        livemode: true,
      } as unknown as Stripe.PaymentIntent,
      recorded,
      issuedAt: new Date("2026-10-07T12:00:00Z"),
      customer,
      seller: PLANX_SELLER,
      branding: null,
      lineItems: getInvoiceLineItems(feeLines, "payer_invoice"),
    });

    expect(invoice.isTest).toBe(false);
  });
});
