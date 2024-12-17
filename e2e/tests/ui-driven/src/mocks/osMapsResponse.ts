import { Page } from "@playwright/test";
import { osMapsStylesResponse } from "./osMapsMockData";

export async function setupOSMapsStyles(page: Page) {
  const ordnanceSurveyMapsStyles = new RegExp(
    /\/proxy\/ordnance-survey\/maps\/vector\/v1\/vts\/resources\/styles.*/,
  );
  await page.route(ordnanceSurveyMapsStyles, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(osMapsStylesResponse),
    });
  });
}

export async function setupOSMapsVectorTiles(page: Page){
    const ordnanceSurveyVectorTiles = new RegExp(
        /\/proxy\/ordnance-survey\/maps\/vector\/v1\/vts\/tile/,
    )

    await page.route(ordnanceSurveyVectorTiles, async (route) => {
        await route.fulfill({
          status: 200,
          body: Buffer.from([]),
        });
      });
}