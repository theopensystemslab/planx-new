import type Stripe from "stripe";

import type { FeeLine } from "../../feeLines.js";
import type { RecordedPaymentIntent } from "../paymentStatus/service.js";
import {
  FLOW_ID,
  FLOW_NAME,
  paymentIntent,
  TEAM_NAME,
  TEAM_SLUG,
} from "../test/mocks.js";
import { buildVatInvoiceData, groupFeeLinesByIssuer } from "./data.js";
import { PLANX_SELLER } from "./seller.js";

describe("groupFeeLinesByIssuer", () => {
  const feeLines: FeeLine[] = [
    {
      description: "Application fee",
      payee: "council",
      net: 10000,
      vat: 2000,
      total: 12000,
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

  it("groups fee lines by who receives them", () => {
    expect(groupFeeLinesByIssuer(feeLines)).toEqual({
      council: [
        { description: "Application fee", net: 10000, vat: 2000, total: 12000 },
        { description: "Fast Track fee", net: 5000, vat: 1000, total: 6000 },
      ],
      planx: [
        {
          description: "PlanX service charge",
          net: 2500,
          vat: 500,
          total: 3000,
        },
      ],
    });
  });

  it("drops zero-value lines", () => {
    const { council } = groupFeeLinesByIssuer([
      { ...feeLines[0], net: 0, vat: 0, total: 0 },
      feeLines[1],
    ]);

    expect(council.map(({ description }) => description)).toEqual([
      "Fast Track fee",
    ]);
  });
});

describe("buildVatInvoiceData", () => {
  const recorded: RecordedPaymentIntent = {
    sessionId: paymentIntent.metadata.sessionId,
    flowId: FLOW_ID,
    flowName: FLOW_NAME,
    teamSlug: TEAM_SLUG,
    teamName: TEAM_NAME,
    feeBreakdown: null,
  };

  it("builds invoice data with totals summed from the line items", () => {
    const lineItems = [
      { description: "PlanX service charge", net: 2500, vat: 500, total: 3000 },
    ];

    const invoice = buildVatInvoiceData({
      issuer: "planx",
      paymentIntent: {
        ...paymentIntent,
        created: 1791374400,
      } as unknown as Stripe.PaymentIntent,
      recorded,
      customerEmail: "payer@example.com",
      seller: PLANX_SELLER,
      branding: null,
      lineItems,
    });

    expect(invoice).toEqual({
      issuer: "planx",
      invoiceNumber: "pi_test_123",
      issuedAt: new Date("2026-10-07T12:00:00Z"),
      customerEmail: "payer@example.com",
      sessionId: recorded.sessionId,
      flowId: FLOW_ID,
      flowName: FLOW_NAME,
      teamSlug: TEAM_SLUG,
      teamName: TEAM_NAME,
      seller: PLANX_SELLER,
      branding: null,
      lineItems,
      totals: { net: 2500, vat: 500, total: 3000 },
    });
  });
});
