import { expect, Page } from "@playwright/test";
import { mockRoadData } from "./geospatialMocks.js";
import propertyConstraintsResponse from "./propertyConstraintResponse.json" with { type: "json" };
import planningDataResponse from "./planningDataResponse.json" with { type: "json" };

export async function setupGISMockResponse(page: Page) {
  const gisDigitalLandEndpoint = "**/gis/E2E?geom*";
  await page.route(gisDigitalLandEndpoint, async (route, request) => {
    const urlContainsConstraints = checkGISMockRequestUrl(request.url());
    expect(urlContainsConstraints).toEqual(true);
    await route.fulfill({
      status: 200,
      body: JSON.stringify(propertyConstraintsResponse),
    });
  });
}

export function checkGISMockRequestUrl(url: string) {
  const splitUrl = url.split("/").pop()?.split("%2C");
  return (
    splitUrl?.includes("designated.conservationArea") &&
    splitUrl?.includes("listed")
  );
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

export async function setupPlanningDataMockResponse(page: Page) {
  const planningDataEndpoint = new RegExp(
    /https:\/\/www\.planning\.data\.gov\.uk\/entity\.geojson/,
  );
  await page.route(planningDataEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(planningDataResponse),
    });
  });
}

export const planningConstraintHeadersMock = [
  "Planning constraints",
  "These are the planning constraints we think apply to this property",
  "Heritage and conservation",
  "General policy",
  "Heritage and conservation",
  "Flooding",
  "Ecology",
  "Trees",
];
