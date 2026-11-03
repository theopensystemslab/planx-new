import { existsSync } from "node:fs";

import { chromium } from "playwright-core";

import { generateVatInvoicePdf } from "./pdf.js";
import type { VatInvoiceData } from "./types.js";

const executablePath =
  process.env.CHROMIUM_EXECUTABLE_PATH || chromium.executablePath();

const isChromiumInstalled = existsSync(executablePath);

const invoice: VatInvoiceData = {
  kind: "payer_invoice",
  isTest: true,
  invoiceNumber: "pi_test_123",
  issuedAt: new Date("2026-10-07T12:00:00Z"),
  customer: { email: "payer@example.com", name: null, addressLines: [] },
  sessionId: "session-123",
  flowId: "flow-123",
  flowName: "Apply for a lawful development certificate",
  teamSlug: "southwark",
  teamName: "Southwark",
  seller: {
    name: "London Borough of Southwark",
    addressLines: [],
    vatNumber: null,
    companyRegistration: null,
    email: null,
  },
  branding: null,
  lineItems: [
    {
      description: "PlanX service charge",
      net: 2500,
      vat: 500,
      total: 3000,
      vatRate: 20,
    },
  ],
  totals: { net: 2500, vat: 500, total: 3000 },
  vatSummary: [{ rate: 20, net: 2500, vat: 500 }],
};

// Requires a Chromium binary - skipped in environments without one
describe.skipIf(!isChromiumInstalled)("generateVatInvoicePdf", () => {
  it("renders a PDF", async () => {
    const pdf = await generateVatInvoicePdf(invoice);

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30_000);
});
