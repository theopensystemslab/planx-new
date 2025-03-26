import { expect, Page } from "@playwright/test";
import { Feature, MultiPolygon, Polygon } from "geojson";

export const waitForMapComponent = async (page: Page) => {
  await page.waitForFunction(() => {
    const map = document.getElementById("draw-boundary-map");
    return map;
  });
};

export const getMapProperties = async (
  page: Page,
  attribute: "geojsondata" | "drawgeojsondata",
) => {
  const mapComponent = await page.waitForSelector("my-map");
  return await mapComponent.getAttribute(attribute);
};

export const alterDrawGeoJson = async (page: Page) => {
  const map = page.getByTestId("map-test-id");

  await map.click({ button: "left", position: { x: 100, y: 200 } });
  await map.click({ button: "left", position: { x: 150, y: 250 } });
  await map.click({ button: "left", position: { x: 200, y: 250 } });
  await map.click({ button: "left", position: { x: 100, y: 200 } });
};

export const resetMapBoundary = async (page: Page) => {
  const resetButton = page.getByLabel("Reset map view");
  await resetButton.click();

  const resetGeoJson = await getMapProperties(page, "drawgeojsondata");

  expect(resetGeoJson, "drawGeoJsonData should be reset").toEqual(null);
};

export const checkGeoJsonContent = async (
  page: Page,
  attribute: "geojsondata" | "drawgeojsondata",
  geoJson: Feature<Polygon | MultiPolygon>,
) => {
  // Wait for the map component to be present
  const mapComponent = await page.waitForSelector("my-map");

  await page.waitForFunction(() => customElements.get("my-map"));
  await expect(
    page.getByTestId("map-test-id"),
    "Check we can see the map",
  ).toBeVisible();

  // Get the geojsonData attribute
  const geojsonData = await mapComponent.getAttribute(attribute);

  expect(geojsonData).toBeDefined();

  // Exact GeoJSON coords can change with version bumps of OpenLayers and Playwright
  // Compare using .toBeCloseTo() assertion
  const coords: Array<[number, number]> = JSON.parse(geojsonData!).geometry
    .coordinates[0];
  const expectedCoords = geoJson.geometry.coordinates[0];

  coords
    .flat(2)
    .forEach((coord, index) =>
      expect(
        coord,
        "map attribute matches expected mock attribute",
      ).toBeCloseTo(expectedCoords.flat(2)[index]),
    );
};

export const checkUploadFileAltRoute = async (page: Page) => {
  const uploadButton = page.getByTestId("upload-file-button");

  await expect(
    uploadButton,
    "We can see a button to upload a file instead",
  ).toBeVisible();

  await uploadButton.click();

  await expect(
    page.getByRole("heading", { name: "Upload a location plan" }),
    "Should be in a page for uploading a file",
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Drop file here or choose" }),
    "A button for uploading files is visible",
  ).toBeVisible();

  await page.getByTestId("continue-button").click();

  await page.getByTestId("error-message-upload-location-plan").isVisible();

  const useMapButton = page.getByTestId("use-map-button");

  await useMapButton.click();
};
