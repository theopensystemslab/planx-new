import { Page } from "@playwright/test";
import { mockPropertyConstraints, mockRoadData } from "./geospatialMocks";

export async function setupGISMockResponse(page: Page) {
  const gisDigitalLandEndpoint = new RegExp(/\/gis\/E2E\?geom.*/);
  const wildcardPattern = "**/gis/E2E?geom*";
  await page.route(wildcardPattern, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(mockPropertyConstraints),
    });
  });
}

export async function setupRoadsMockResponse(page: Page) {
  const gisRoadsEndpoint = new RegExp(/\/roads\?.*/);
  await page.route(gisRoadsEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(mockRoadData),
    });
  });
}
