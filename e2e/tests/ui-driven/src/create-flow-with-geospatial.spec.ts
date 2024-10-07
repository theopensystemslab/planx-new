import { expect, test } from "@playwright/test";
import type { Context } from "./helpers/context";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "./helpers/context";
import { getTeamPage } from "./helpers/getPage";
import { createAuthenticatedSession } from "./helpers/globalHelpers";
import { answerFindProperty, answerUploadAndLabel, clickContinue } from "./helpers/userActions";
import { PlaywrightEditor } from "./pages/Editor";

test.describe("Flow creation, publish and preview", () => {
  let context: Context = {
    ...contextDefaults,
  };
  const serviceProps = {
    name: "A Test Service",
    slug: "a-test-service",
  };

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (error) {
      await tearDownTestContext(context);
      throw error;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext(context);
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

    // update context to allow flow to be torn down
    context.flow = { ...serviceProps };

    await editor.createFindProperty();
    await expect(editor.nodeList).toContainText(["Find property"]);
    await editor.createInternalPortal();
    await editor.populateInternalPortal();
    await page.getByRole("link", { name: "start" }).click(); // return to main flow
    await editor.createFilter();
    await editor.createUploadAndLabel();
    // TODO: editor.createPropertyInfo()
    await editor.createDrawBoundary();
    await editor.createPlanningConstraints();
    // await editor.createFileUpload();

    await expect(editor.nodeList).toContainText([
      "Find property",
      "an internal portalEdit Portal",
      "(Flags Filter)ImmuneMissing informationPermission neededPrior approvalNoticePermitted developmentNot development(No Result)",
      "Upload and label",
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
    await page.goto(`/${context.team.slug}/${serviceProps.slug}`);
    page.getByRole("button", { name: "CHECK FOR CHANGES TO PUBLISH" }).click();
    page.getByRole("button", { name: "PUBLISH", exact: true }).click();

    let previewLink = page.getByRole("link", {
      name: "Open published service",
    });
    await expect(previewLink).toBeVisible();

    await page.goto(`/${context.team.slug}/${serviceProps.slug}`);

    // Toggle flow online
    page.locator('[aria-label="Service settings"]').click();
    page.getByLabel("Offline").click();
    page.getByRole("button", { name: "Save", disabled: false }).click();
    await expect(
      page.getByText("Service settings updated successfully"),
    ).toBeVisible();

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
    await expect(
      page.locator("h1", { hasText: "Find the property" }),
    ).toBeVisible();
    await answerFindProperty(page);
    await clickContinue({ page });

    await expect(
      page.locator("h1", { hasText: "A notice inside a portal!" }),
    ).toBeVisible();
    await clickContinue({ page });

    await answerUploadAndLabel(page)

    // TODO: answer filter?
    // TODO: answer uploadAndLabel
    // TODO: answerPropertyInfo, answerDrawBoundary, answerPlanningConstraints
  });
});
