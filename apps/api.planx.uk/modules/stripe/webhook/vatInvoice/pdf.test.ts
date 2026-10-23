import { existsSync } from "node:fs";

import { chromium } from "playwright-core";

import { generateVatInvoicePdf } from "./pdf.js";
import type { VatInvoiceData } from "./types.js";

const executablePath =
  process.env.CHROMIUM_EXECUTABLE_PATH || chromium.executablePath();

const isChromiumInstalled = existsSync(executablePath);

const invoice: VatInvoiceData = {
  issuer: "planx",
  invoiceNumber: "pi_test_123",
  issuedAt: new Date("2026-10-07T12:00:00Z"),
  customerEmail: "payer@example.com",
  sessionId: "session-123",
  flowId: "flow-123",
  flowName: "Apply for a lawful development certificate",
  teamSlug: "southwark",
  teamName: "Southwark",
  seller: {
    name: "Open Systems Lab",
    addressLines: [],
    vatNumber: null,
    companyRegistration: null,
    email: null,
  },
  branding: null,
  lineItems: [
    { description: "PlanX service charge", net: 2500, vat: 500, total: 3000 },
  ],
  totals: { net: 2500, vat: 500, total: 3000 },
};

// Requires a Chromium binary - skipped in environments without one
describe.skipIf(!isChromiumInstalled)("generateVatInvoicePdf", () => {
  it("renders a PDF", async () => {
    const pdf = await generateVatInvoicePdf(invoice);

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30_000);
});
