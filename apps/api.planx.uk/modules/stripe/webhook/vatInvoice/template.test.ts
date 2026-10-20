import { renderVatInvoiceHtml } from "./template.js";
import type { VatInvoiceData } from "./types.js";

const invoice = (overrides: Partial<VatInvoiceData> = {}): VatInvoiceData => ({
  issuer: "council",
  invoiceNumber: "pi_test_123",
  issuedAt: new Date("2026-10-07T12:00:00Z"),
  customerEmail: "payer@example.com",
  sessionId: "session-123",
  flowId: "flow-123",
  flowName: "Apply for a lawful development certificate",
  teamSlug: "southwark",
  teamName: "Southwark",
  seller: {
    name: "London Borough of Southwark",
    addressLines: ["160 Tooley Street", "London", "SE1 2QH"],
    vatNumber: "GB123456789",
    companyRegistration: null,
    email: "planning@southwark.gov.uk",
  },
  branding: {
    logo: "https://example.com/logo.png",
    primaryColour: "#2E3192",
  },
  lineItems: [
    { description: "Application fee", net: 11500, vat: 0, total: 11500 },
  ],
  totals: { net: 11500, vat: 0, total: 11500 },
  ...overrides,
});

describe("renderVatInvoiceHtml", () => {
  it("includes the invoice, seller and payment details", () => {
    const html = renderVatInvoiceHtml(invoice());

    expect(html).toContain("pi_test_123");
    expect(html).toContain("7 October 2026");
    expect(html).toContain("payer@example.com");
    expect(html).toContain("Apply for a lawful development certificate");
    expect(html).toContain("session-123");
    expect(html).toContain("London Borough of Southwark");
    expect(html).toContain("160 Tooley Street");
    expect(html).toContain("VAT registration number: GB123456789");
    expect(html).not.toContain("Company registration number");
  });

  it("lists each line item and the totals", () => {
    const html = renderVatInvoiceHtml(
      invoice({
        lineItems: [
          { description: "Application fee", net: 11500, vat: 0, total: 11500 },
          { description: "Fast Track fee", net: 5000, vat: 1000, total: 6000 },
        ],
        totals: { net: 16500, vat: 1000, total: 17500 },
      }),
    );

    expect(html).toContain("Fast Track fee");
    expect(html).toContain("£50.00");
    expect(html).toContain("£10.00");
    expect(html).toContain("£175.00");
  });

  it("applies council branding", () => {
    const html = renderVatInvoiceHtml(invoice());

    expect(html).toContain('<img src="https://example.com/logo.png"');
    expect(html).toContain("background: #2E3192");
  });

  it("renders an embedded logo without a primary colour (PlanX invoice)", () => {
    const html = renderVatInvoiceHtml(
      invoice({
        issuer: "planx",
        branding: { logo: "data:image/png;base64,abc", primaryColour: null },
      }),
    );

    expect(html).toContain('<img src="data:image/png;base64,abc"');
    expect(html).not.toContain("background:");
  });

  it("renders without branding", () => {
    const html = renderVatInvoiceHtml(invoice({ branding: null }));

    expect(html).not.toContain("<img");
    expect(html).not.toContain("background:");
  });

  it("escapes user-controlled values", () => {
    const html = renderVatInvoiceHtml(
      invoice({ flowName: "<script>alert(1)</script>" }),
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("ignores unsafe branding values", () => {
    const html = renderVatInvoiceHtml(
      invoice({
        branding: {
          logo: "javascript:alert(1)",
          primaryColour: "red; } body { display: none",
        },
      }),
    );

    expect(html).not.toContain("<img");
    expect(html).not.toContain("display: none");
    expect(html).toContain("background: #0010A4");
  });
});
