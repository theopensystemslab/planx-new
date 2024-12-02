import { expect, Page } from "@playwright/test";
import { Feature } from "geojson";

export const checkGeoJsonContent = async (page: Page, geoJson: Feature) => {
  // Wait for the map component to be present
  const mapComponent = await page.waitForSelector("my-map");

  // Get the geojsonData attribute
  const geojsonData = await mapComponent.getAttribute("geojsondata");

  expect(JSON.parse(geojsonData!)).toEqual(geoJson);
};
