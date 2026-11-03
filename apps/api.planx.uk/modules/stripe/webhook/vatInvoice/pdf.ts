import { chromium } from "playwright-core";

import { renderVatInvoiceHtml } from "./template.js";
import type { VatInvoiceData } from "./types.js";

const RENDER_TIMEOUT_MS = 30_000;

/**
 * Render a VAT invoice as a PDF
 *
 * Uses the system Chromium in Docker (Playwright's bundled browsers don't support Alpine)
 * Locally, falls back to a browser installed via `npx playwright install chromium`
 */
export const generateVatInvoicePdf = async (
  data: VatInvoiceData,
): Promise<Buffer> => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
    timeout: RENDER_TIMEOUT_MS,
  });

  try {
    const page = await browser.newPage();
    // Wait for "load" so that remote images (e.g. council logo) are rendered
    await page.setContent(renderVatInvoiceHtml(data), {
      waitUntil: "load",
      timeout: RENDER_TIMEOUT_MS,
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
};
