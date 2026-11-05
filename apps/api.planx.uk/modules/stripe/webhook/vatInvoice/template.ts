import { format } from "date-fns";
import he from "he";

import { formatPence } from "../../helpers.js";
import type {
  VatInvoiceCustomer,
  VatInvoiceData,
  VatInvoiceSeller,
} from "./types.js";

const TEXT_COLOUR = "#0B0C0C";
const LABEL_COLOUR = "#505A5F";

const escape = (value: string) => he.escape(value);

export const DEFAULT_PRIMARY_COLOUR = "#0010A4";

/**
 * Only allow hex colours, falling back to the default colour if invalid
 */
export const getPrimaryColour = (colour: string | null | undefined) => {
  if (!colour) return null;
  return /^#[0-9a-f]{3,8}$/i.test(colour) ? colour : DEFAULT_PRIMARY_COLOUR;
};

const getLogoUrl = (logo: string | null | undefined) => {
  if (!logo) return null;
  if (logo.startsWith("data:image/")) return logo;
  try {
    const { protocol } = new URL(logo);
    return ["https:", "http:"].includes(protocol) ? logo : null;
  } catch {
    return null;
  }
};

const renderSeller = (seller: VatInvoiceSeller) =>
  [
    `<strong>${escape(seller.name)}</strong>`,
    ...seller.addressLines.map(escape),
    seller.email && escape(seller.email),
    seller.vatNumber && `VAT registration number: ${escape(seller.vatNumber)}`,
    seller.companyRegistration &&
      `Company registration number: ${escape(seller.companyRegistration)}`,
  ]
    .filter(Boolean)
    .join("<br />");

const renderCustomer = (customer: VatInvoiceCustomer) =>
  [customer.name, ...customer.addressLines, customer.email]
    .filter((line): line is string => Boolean(line))
    .map(escape)
    .join("<br />");

/**
 * Issued after payment, so titled a receipt
 */
const getTitle = ({ isTest }: VatInvoiceData) =>
  isTest ? "TEST VAT receipt" : "VAT receipt";

export const renderVatInvoiceHtml = (invoice: VatInvoiceData): string => {
  const { seller, branding, lineItems, totals, vatSummary } = invoice;
  const title = getTitle(invoice);
  const primaryColour = getPrimaryColour(branding?.primaryColour);
  const logoUrl = getLogoUrl(branding?.logo);

  const rows = lineItems
    .map(
      ({ description, net, vatRate, vat, total }) => `
          <tr>
            <td>${escape(description)}</td>
            <td class="amount">${formatPence(net)}</td>
            <td class="amount">${vatRate}%</td>
            <td class="amount">${formatPence(vat)}</td>
            <td class="amount">${formatPence(total)}</td>
          </tr>`,
    )
    .join("");

  const vatRows = vatSummary
    .map(
      ({ rate, net, vat }) => `
          <tr>
            <td>${rate}%</td>
            <td class="amount">${formatPence(net)}</td>
            <td class="amount">${formatPence(vat)}</td>
          </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title} ${escape(invoice.invoiceNumber)}</title>
    <style>
      @page { size: A4; margin: 20mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        line-height: 1.4;
        color: ${TEXT_COLOUR};
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        ${
          primaryColour
            ? // Council logos are designed to sit on their primary colour, as in the public service header
              `padding: 6mm 8mm; background: ${primaryColour}; color: #FFFFFF;`
            : `padding-bottom: 6mm; border-bottom: 2mm solid ${TEXT_COLOUR};`
        }
      }
      header img { max-height: 15mm; max-width: 60mm; }
      h1 { margin: 0; font-size: 22pt; }
      h2 { margin: 0 0 2mm; font-size: 12pt; }
      section { margin-top: 8mm; }
      .details { display: flex; justify-content: space-between; gap: 10mm; }
      .details > div { flex: 1; }
      dl { flex: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 8mm; margin: 0; }
      dd, p { margin: 0; }
      .label {
        margin: 0 0 0.5mm;
        font-size: 9pt;
        font-weight: normal;
        font-variant-caps: all-small-caps;
        letter-spacing: 0.05em;
        color: ${LABEL_COLOUR};
      }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 2mm; border-bottom: 0.3mm solid #B1B4B6; text-align: left; }
      .amount { text-align: right; white-space: nowrap; }
      tfoot td { font-weight: bold; border-bottom: none; }
      .vat-summary { width: 50%; margin-left: auto; }
      .metadata { margin-top: 12mm; font-size: 8pt; color: ${LABEL_COLOUR}; }
      .test-banner {
        margin-bottom: 6mm;
        padding: 3mm 4mm;
        border: 0.7mm solid #D4351C;
        color: #D4351C;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    ${
      invoice.isTest
        ? `<div class="test-banner">TEST - this was paid in Stripe test mode and is not a valid VAT receipt</div>`
        : ""
    }
    <header>
      <h1>${title}</h1>
      ${logoUrl ? `<img src="${escape(logoUrl)}" alt="${escape(seller.name)}" />` : ""}
    </header>

    <section class="details">
      <div>
        <h2 class="label">From</h2>
        <p>${renderSeller(seller)}</p>
      </div>
      <div>
        <h2 class="label">Billed to</h2>
        <p>${renderCustomer(invoice.customer)}</p>
      </div>
    </section>

    <section class="details">
      <dl>
        <div>
          <dt class="label">Invoice number</dt>
          <dd>${escape(invoice.invoiceNumber)}</dd>
        </div>
        <div>
          <dt class="label">Date of issue</dt>
          <dd>${format(invoice.issuedAt, "d MMMM yyyy")}</dd>
        </div>
        <div>
          <dt class="label">Service</dt>
          <dd>${escape(invoice.flowName)}</dd>
        </div>
      </dl>
    </section>

    <section>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount">Net</th>
            <th class="amount">VAT rate</th>
            <th class="amount">VAT</th>
            <th class="amount">Total</th>
          </tr>
        </thead>
        <tbody>${rows}
        </tbody>
        <tfoot>
          <tr>
            <td>Total paid</td>
            <td class="amount">${formatPence(totals.net)}</td>
            <td></td>
            <td class="amount">${formatPence(totals.vat)}</td>
            <td class="amount">${formatPence(totals.total)}</td>
          </tr>
        </tfoot>
      </table>
    </section>

    <section class="vat-summary">
      <h2>VAT summary</h2>
      <table>
        <thead>
          <tr>
            <th>Rate</th>
            <th class="amount">Net</th>
            <th class="amount">VAT</th>
          </tr>
        </thead>
        <tbody>${vatRows}
        </tbody>
      </table>
    </section>

    <!-- For PlanX and council staff to trace the payment -->
    <footer class="metadata">
      Session ID: ${escape(invoice.sessionId)}<br />
      Payment ID: ${escape(invoice.paymentId)}
    </footer>
  </body>
</html>`;
};
