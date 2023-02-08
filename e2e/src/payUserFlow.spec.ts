import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "fs";
import path from "path";
import { cards } from "./constants";
import { getClient, setUpTestContext, tearDownTestContext } from "./context";
import { waitForPaymentResponse } from "./payUtils/awaitForPaymentResponse";
import { fillGovUkCardDetails } from "./payUtils/fillGovUkCardDetails";
import { prodGqlPublic } from "./utils";

test.setTimeout(90_000);

export const TEST_EMAIL = "test@test.com";

const URL = "http://localhost:3000";

const TEAM_SLUG = "southwark";
const FLOW_SLUG = "apply-for-a-lawful-development-certificate";

export const DEFAULT_SCREEN_TRANSITION_WAIT_TIME = 300;

let context: any = {
  user: {
    firstName: "test",
    lastName: "test",
    email: TEST_EMAIL,
  },
  team: {
    name: "Southwark",
    slug: TEAM_SLUG,
    logo: "https://placedog.net/250/250",
    primaryColor: "#F30415",
    homepage: "example.com",
  },
};

test.describe("Full LDC application with payment", async () => {
  const client = getClient();

  test.beforeAll(async () => {
    const {
      flows: [{ id: productionFlowId }],
    } = await prodGqlPublic(
      `
        query GetFlowBySlug {
          flows(
            where: {
              team: {slug: {_eq: "${TEAM_SLUG}"}},
              slug: {_eq: "${FLOW_SLUG}"}, 
            }) {
            id
          }
        }
      `
    );

    const {
      published_flows: [publishedFlow],
    } = await prodGqlPublic(
      `
        query GetPublishedFlowByFlowId($id: uuid!) {
          published_flows(
            where: {flow_id: {_eq: $id}},
            limit: 1,
            order_by: {created_at: desc}
          ) {
            id
            data
            summary
          }
        }
      `,
      {
        id: productionFlowId,
      }
    );

    context.flow = {
      data: publishedFlow.data,
      slug: FLOW_SLUG,
    };

    try {
      context = await setUpTestContext(client, context);
    } catch (e) {
      // ensure proper teardown if setup fails
      await tearDownTestContext(client, context);
      throw e;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext(client, context);
  });

  test("Should pay within GOV.UK and send the application", async ({
    page,
  }) => {
    await navigateToPayComponent({ page, mode: "preview" });

    await page.getByText("Pay using GOV.UK Pay").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
    await page.getByLabel("Email address").fill(TEST_EMAIL);
    await page.getByTestId("continue-button").click();

    const { payment_id: paymentRef } = await waitForPaymentResponse({
      page,
      teamSlug: TEAM_SLUG,
    });

    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
  });
});

function clickButtonWithTextAndWait(page: Page) {
  return async (text: string, waitFor: number) => {
    await page.getByText(text, { exact: true }).click();
    await page.getByTestId("continue-button").click();
    await page.waitForTimeout(waitFor);
  };
}

function uploadFileToInput(page: Page) {
  return async ({ file, selector }: { selector?: string; file: Buffer }) => {
    await page.setInputFiles(selector || "input", {
      name: "test.png",
      mimeType: "image/png",
      buffer: file,
    });
  };
}

async function navigateToPayComponent({
  page,
  mode,
}: {
  page: Page;
  mode: "preview" | "unpublished";
}) {
  const dummyImage = readFileSync(path.join(__dirname, "./assets/test.png"));

  // XXX: When there is a page transition the animations take few ms to finish, due to this, if there are similar action (e.g Click "No")
  // in a row, the second click will run twice on the same page and fail the test.
  // To avoid this, we wait for the animation to finish before clicking the next button.
  const clickButtonWithTextAndContinue = (text: string) =>
    clickButtonWithTextAndWait(page)(text, DEFAULT_SCREEN_TRANSITION_WAIT_TIME);

  await page.goto(`${URL}/${TEAM_SLUG}/${FLOW_SLUG}/${mode}?analytics=false`);
  await page.locator("#email").fill(TEST_EMAIL);
  await page.getByLabel("Confirm email address").fill(TEST_EMAIL);
  await page.getByTestId("continue-button").click();

  await page.getByLabel("Postcode").fill("SE12QH");

  await page.waitForResponse((resp) => resp.url().includes("postcode"));

  await page.getByText("Select an address").click();

  await page
    .getByText(
      "SOUTHWARK COUNCIL, 160, TOOLEY STREET, LONDON"
    )
    .click();

  await page.getByTestId("continue-button").click();

  await page.getByTestId("continue-button").click();

  await clickButtonWithTextAndContinue("Yes");

  await page.getByTestId("continue-button").click();
  await page.getByTestId("upload-file-button").click();

  await uploadFileToInput(page)({ file: dummyImage });

  await page.getByTestId("continue-button").click();

  // Planning constraints
  await page.waitForResponse((resp) =>
    resp.url().includes(`/gis/${TEAM_SLUG}?geom=`)
  );
  await page.getByTestId("continue-button").click();

  await page.getByText("Existing changes I have made in the past").click();
  await page.getByTestId("continue-button").click();

  await page.getByLabel("Describe the project").fill("Test");
  await page.getByTestId("continue-button").click();

  await page.getByText("Windows and doors", { exact: true }).click();
  await page.getByText("Replace windows or doors", { exact: true }).click();
  await page.getByTestId("continue-button").click();

  await page.getByText("Replacement of doors with windows").click();
  await page.getByTestId("continue-button").click();

  await clickButtonWithTextAndContinue("Yes"); // Were the works carried out more than 4 years ago?
  await clickButtonWithTextAndContinue("No"); // Have the works been completed?
  await clickButtonWithTextAndContinue("No"); //Has anyone ever attempted to conceal the changes?
  await clickButtonWithTextAndContinue("No"); // Has enforcement action been taken about these changes?
  await clickButtonWithTextAndContinue("No, definitely not"); //Might the works affect any tree with a trunk wider than 100mm?
  await clickButtonWithTextAndContinue("No"); //Is the property in the Greater London Authority area?
  await clickButtonWithTextAndContinue("No"); //Are you applying on behalf of someone else?

  await page.getByText("Private individual").click();
  await page.getByTestId("continue-button").click();

  await page.getByLabel("First name").fill("Test");
  await page.getByTestId("continue-button").click();

  await page.getByLabel("Last name").fill("Test");
  await page.getByTestId("continue-button").click();

  await page.getByLabel("Title").fill("Mx");
  await page.getByTestId("continue-button").click();

  await page.getByText("Yes", { exact: true }).click();
  await page.getByTestId("continue-button").click();

  await page.getByLabel("Email address").fill(TEST_EMAIL);
  await page.getByTestId("continue-button").click();

  await page.getByLabel("Telephone number").fill("99999");
  await page.getByTestId("continue-button").click();

  await page.getByText("Me, the applicant").click();
  await page.getByTestId("continue-button").click();
  await page.getByText("Sole owner").click();
  await page.getByTestId("continue-button").click();

  await uploadFileToInput(page)({ file: dummyImage }); // Upload site plan

  await page.getByTestId("continue-button").click();

  await clickButtonWithTextAndContinue("No");

  await uploadFileToInput(page)({ file: dummyImage }); // Upload elevations

  await page.getByTestId("continue-button").click();

  await clickButtonWithTextAndContinue("No"); // Would you like to upload any detail drawings?
  await clickButtonWithTextAndContinue("No"); // Did the works involve any alterations to ground levels?
  await clickButtonWithTextAndContinue("No"); // Would you like to upload any photographs of the property as it is today?
  await clickButtonWithTextAndContinue("No"); // Would you like to upload any other additional drawings or documents?

  await page.getByText("I cannot provide any evidence").click();
  await page.getByTestId("continue-button").click();

  await page.getByText("5 hectares or less").click();
  await page.getByTestId("continue-button").click();

  await clickButtonWithTextAndContinue("No"); // Are the public allowed to access the building?
  await clickButtonWithTextAndContinue("No"); // Is this application a resubmission?
  await clickButtonWithTextAndContinue("No"); // Are you also submitting another proposal for the same site today?
  await clickButtonWithTextAndContinue("No"); // Did you get any pre-application advice before making this application?

  await page.getByTestId("continue-button").click();

  await page.getByText("None of the above apply to me").click();
  await page.getByTestId("continue-button").click();

  await page
    .getByText("The information contained in this application is truthful")
    .click();
  await page.getByTestId("continue-button").click();
}
