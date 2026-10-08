import type { VatInvoiceData } from "./types.js";

/**
 * Render a VAT invoice as a PDF
 *
 * TODO: Playwright HTML→PDF
 */
export const generateVatInvoicePdf = async (
  _data: VatInvoiceData,
): Promise<Buffer> => {
  throw new Error("VAT invoice PDF generation is not implemented");
};
