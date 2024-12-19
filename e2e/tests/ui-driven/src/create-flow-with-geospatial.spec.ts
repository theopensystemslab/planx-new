import { expect, test } from "@playwright/test";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "./helpers/context";
import { getTeamPage } from "./helpers/getPage";
import { createAuthenticatedSession } from "./helpers/globalHelpers";
import { answerQuestion, clickContinue } from "./helpers/userActions";
import { PlaywrightEditor } from "./pages/Editor";
import {
  navigateToService,
  publishService,
  turnServiceOnline,
} from "./helpers/navigateAndPublish";
import { TestContext } from "./helpers/types";
import { serviceProps } from "./helpers/serviceData";
import {
  alterDrawGeoJson,
  checkGeoJsonContent,
  checkUploadFileAltRoute,
  getMapProperties,
  resetMapBoundary,
  waitForMapComponent,
} from "./helpers/geospatialChecks";
import {
  GeoJsonChangeHandler,
  mockChangedMapGeoJson,
  mockPropertyTypeOptions,
  mockTitleBoundaryGeoJson,
} from "./mocks/geospatialMocks";
import {
  setupOSMapsStyles,
  setupOSMapsVectorTiles,
} from "./mocks/osMapsResponse";
import {
  planningConstraintHeadersMock,
  setupGISMockResponse,
  setupRoadsMockResponse,
} from "./mocks/gisResponse";
import {
  answerFindProperty,
  userChallengesPlanningConstraint,
} from "./helpers/geoSpatialUserActions";

test.describe("Flow creation, publish and preview", () => {
  let context: TestContext = {
    ...contextDefaults,
  };

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (error) {
      await tearDownTestContext();
      throw error;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext();
  });

  test("Create a flow", async ({ browser }) => {
    const page = await getTeamPage({
      browser,
      userId: context.user!.id!,
      teamName: context.team.name,
    });

    const editor = new PlaywrightEditor(page);

    page.on("dialog", (dialog) => dialog.accept(serviceProps.name));
    await editor.addNewService();

    await editor.createFindProperty();
    await expect(editor.nodeList).toContainText(["Find property"]);
    // Find property will automate past this question at first
    await editor.createQuestionWithDataFieldOptions(
      "What type of property is it?",
      mockPropertyTypeOptions,
      "property.type",
    );
    await expect(editor.nodeList).toContainText([
      "What type of property is it?",
    ]);
    // but property info "change" button will navigate back to it
    await editor.createPropertyInformation();
    await expect(editor.nodeList).toContainText(["About the property"]);
    await editor.createInternalPortal();
    await editor.populateInternalPortal();
    await page.getByRole("link", { name: "start" }).click(); // return to main flow
    // await editor.createUploadAndLabel();
    await editor.createDrawBoundary();
    await editor.createPlanningConstraints();
    // await editor.createFileUpload();

    await expect(editor.nodeList).toContainText([
      "Find property",
      "an internal portalEdit Portal",
      "Confirm your location plan",
      "Planning constraints",
      // "File upload",
    ]);
  });

  test("Publish and preview flow with geospatial components", async ({
    browser,
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });
    // publish flow
    await navigateToService(page, serviceProps.slug);
    await publishService(page);

    let previewLink = page.getByRole("link", {
      name: "Open published service",
    });
    await expect(previewLink).toBeVisible();

    await navigateToService(page, serviceProps.slug);
    await turnServiceOnline(page);

    // Exit back to main Editor page
    page.locator('[aria-label="Editor"]').click();
    previewLink = page.getByRole("link", {
      name: "Open published service",
    });
    await expect(previewLink).toBeVisible();

    // view published flow
    await page.goto(
      `/${context.team.slug}/${serviceProps.slug}/published?analytics=false`,
    );

    setupOSMapsStyles(page);
    setupOSMapsVectorTiles(page);

    await setupGISMockResponse(page);
    await setupRoadsMockResponse(page);

    await expect(
      page.locator("h1", { hasText: "Find the property" }),
    ).toBeVisible();
    await answerFindProperty(page);
    await clickContinue({ page });

    await expect(
      page.getByRole("heading", { name: "About the property" }),
    ).toBeVisible();

    // Check map component has geoJson content
    await checkGeoJsonContent(page, "geojsondata", mockTitleBoundaryGeoJson);

    // Check property info is being shown
    await expect(page.getByText("Test Street, Testville")).toBeVisible();
    await expect(page.getByText("Residential - Semi Detached")).toBeVisible();
    const changeButton = page.getByRole("button", {
      name: "Change your Property type",
    });

    await changeButton.click();

    // ensure residential is selected on back nav to test previouslySubmittedData is working
    await expect(
      page.getByRole("radio", { name: "Residential", checked: true }),
    ).toBeVisible();

    await answerQuestion({
      page: page,
      title: "What type of property is it?",
      answer: "Commercial",
    });

    // navigate back to Property Info page
    await clickContinue({ page });
    await expect(
      page.getByRole("heading", { name: "About the property" }),
    ).toBeVisible();

    // Ensure we've successfully changed property type
    await expect(page.getByText("Residential - Semi Detached")).toBeHidden();
    await expect(page.getByText("Commercial")).toBeVisible();

    await clickContinue({ page });

    await expect(
      page.locator("h1", { hasText: "A notice inside a portal!" }),
    ).toBeVisible();
    await clickContinue({ page });

    const drawBoundaryTitle = page.getByRole("heading", {
      name: "Confirm your location plan",
    });
    await expect(drawBoundaryTitle).toBeVisible();

    await checkGeoJsonContent(
      page,
      "drawgeojsondata",
      mockTitleBoundaryGeoJson,
    );

    const area = "The property boundary you have drawn is 490.37";

    await expect(page.getByText(area)).toBeVisible();

    // navigate to upload file page and back
    await checkUploadFileAltRoute(page);

    await expect(
      drawBoundaryTitle,
      "We have navigated back to the map component",
    ).toBeVisible();

    // ensure map has loaded correctly
    await waitForMapComponent(page);

    await resetMapBoundary(page);

    await alterDrawGeoJson(page);

    // extract new GeoJSON data
    const newGeoJson = await getMapProperties(page, "drawgeojsondata");
    const parsedJson: GeoJsonChangeHandler = JSON.parse(newGeoJson!);

    // check it matches our static mock
    await checkGeoJsonContent(page, "drawgeojsondata", mockChangedMapGeoJson);

    await expect(
      page.getByText(`${parsedJson.properties!["area.squareMetres"]}`),
      "The correct value for area comes from the map properties ",
    ).toBeVisible();

    await clickContinue({ page });

    await expect(
      page.locator("h1", { hasText: "Planning constraints" }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "These are the planning constraints we think apply to this property",
      ),
    ).toBeVisible();

    const listedBuildingConstraintRowItem = page.getByRole("button", {
      name: "Listed building outlines",
    });

    await expect(listedBuildingConstraintRowItem).toBeVisible();

    await listedBuildingConstraintRowItem.click();

    await userChallengesPlanningConstraint(page);

    await expect(
      listedBuildingConstraintRowItem.getByText("Marked as not applicable"),
    ).toBeVisible();

    // click to hide constraint data
    await listedBuildingConstraintRowItem.click();

    // ensure constraints that don't apply show up
    await page
      .getByRole("button", { name: "Constraints that don't apply" })
      .click();

    const dontApplyHeadings = await page.getByRole("heading").allTextContents();

    expect(dontApplyHeadings).toEqual(planningConstraintHeadersMock);

    // TODO: answer uploadAndLabel
    // TODO: answerPropertyInfo, answerPlanningConstraints
  });
});
