import { renderVatInvoiceHtml } from "./template.js";
import type { VatInvoiceData } from "./types.js";

const invoice = (overrides: Partial<VatInvoiceData> = {}): VatInvoiceData => ({
  kind: "payer_invoice",
  invoiceNumber: "pi_test_123",
  issuedAt: new Date("2026-10-07T12:00:00Z"),
  customer: {
    email: "payer@example.com",
    name: "Jo Bloggs",
    addressLines: ["1 High Street", "London", "SE1 2QH"],
  },
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
    {
      description: "Application fee",
      net: 11500,
      vat: 0,
      total: 11500,
      vatRate: 0,
    },
  ],
  totals: { net: 11500, vat: 0, total: 11500 },
  vatSummary: [{ rate: 0, net: 11500, vat: 0 }],
  ...overrides,
});

describe("renderVatInvoiceHtml", () => {
  it("includes the invoice, seller and payment details", () => {
    const html = renderVatInvoiceHtml(invoice());

    expect(html).toContain("pi_test_123");
    expect(html).toContain("7 October 2026");
    expect(html).toContain("Apply for a lawful development certificate");
    expect(html).toContain("session-123");
    expect(html).toContain("London Borough of Southwark");
    expect(html).toContain("160 Tooley Street");
    expect(html).toContain("VAT registration number: GB123456789");
    expect(html).not.toContain("Company registration number");
  });

  it("includes the customer's details", () => {
    const html = renderVatInvoiceHtml(invoice());

    expect(html).toContain("Billed to");
    expect(html).toContain("Jo Bloggs<br />1 High Street<br />London");
    expect(html).toContain("payer@example.com");
  });

  it("bills the customer by email alone when there are no other details", () => {
    const html = renderVatInvoiceHtml(
      invoice({
        customer: { email: "payer@example.com", name: null, addressLines: [] },
      }),
    );

    expect(html).toContain("<p>payer@example.com</p>");
  });

  it("lists each line item with its VAT rate, and the totals", () => {
    const html = renderVatInvoiceHtml(
      invoice({
        lineItems: [
          {
            description: "Application fee",
            net: 11500,
            vat: 0,
            total: 11500,
            vatRate: 0,
          },
          {
            description: "PlanX service charge",
            net: 2500,
            vat: 500,
            total: 3000,
            vatRate: 20,
          },
        ],
        totals: { net: 14000, vat: 500, total: 14500 },
      }),
    );

    expect(html).toContain("PlanX service charge");
    expect(html).toContain("20%");
    expect(html).toContain("£25.00");
    expect(html).toContain("£5.00");
    expect(html).toContain("£145.00");
  });

  it("summarises VAT by rate", () => {
    const html = renderVatInvoiceHtml(
      invoice({
        vatSummary: [
          { rate: 20, net: 2500, vat: 500 },
          { rate: 0, net: 11500, vat: 0 },
        ],
      }),
    );

    expect(html).toContain("VAT summary");
    expect(html).toMatch(/<td>20%<\/td>\s*<td class="amount">£25\.00<\/td>/);
    expect(html).toMatch(/<td>0%<\/td>\s*<td class="amount">£115\.00<\/td>/);
  });

  it("applies council branding", () => {
    const html = renderVatInvoiceHtml(invoice());

    expect(html).toContain('<img src="https://example.com/logo.png"');
    expect(html).toContain("background: #2E3192");
  });

  it("renders without branding", () => {
    const html = renderVatInvoiceHtml(invoice({ branding: null }));

    expect(html).not.toContain("<img");
    expect(html).not.toContain("background:");
  });

  it("escapes user-controlled values", () => {
    const html = renderVatInvoiceHtml(
      invoice({
        flowName: "<script>alert(1)</script>",
        customer: {
          email: "payer@example.com",
          name: "<b>Jo</b>",
          addressLines: [],
        },
      }),
    );

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Jo</b>");
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
