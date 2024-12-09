import { expect, Page } from "@playwright/test";
import { Feature } from "geojson";

export const checkGeoJsonContent = async (
  page: Page,
  attribute: "geojsondata" | "drawgeojsondata",
  geoJson: Feature,
) => {
  // Wait for the map component to be present
  const mapComponent = await page.waitForSelector("my-map");
  await expect(
    page.getByTestId("map-test-id"),
    "Check we can see the map",
  ).toBeVisible();

  // Get the geojsonData attribute
  const geojsonData = await mapComponent.getAttribute(attribute);

  expect(JSON.parse(geojsonData!)).toEqual(geoJson);
};

export const checkUploadFileAltRoute = async (page: Page) => {
  const uploadButton = page.getByTestId("upload-file-button");

  await expect(
    uploadButton,
    "We can see a button to upload a file instead",
  ).toBeVisible();
  await expect(
    page.getByText("490.37"),
    "We can see a value for area",
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

  const useMapButton = page.getByTestId("use-map-button");

  await useMapButton.click();
};
