import { type Page } from "@playwright/test";

export async function waitForPaymentResponse({
  page,
  teamSlug,
}: {
  page: Page;
  teamSlug: string;
}) {
  let response: Record<string, any> = {};

  await page.waitForResponse(async (resp) => {
    if (resp.url().includes(`pay/${teamSlug}/`) && resp.ok()) {
      response = await resp.json();

      return true;
    }
    return false;
  });

  return response;
}
