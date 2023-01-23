import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import payFlow from "./flows/pay-flow.json";
import { getClient, setUpTestContext, tearDownTestContext } from "./context";

const TEAM_SLUG = "buckinghamshire"; // local authority with GOV Pay enabled
let context: any = {
  user: {
    firstName: "test",
    lastName: "test",
    email: "e2epaytest@test.com",
  },
  team: {
    name: "Buckinghamshire",
    slug: "buckinghamshire",
    logo: "https://placedog.net/250/250",
    primaryColor: "#F30415",
    homepage: "example.com",
  },
  flow: {
    slug: "pay-test",
    data: payFlow,
  },
};
const previewURL = `/${TEAM_SLUG}/${context.flow.slug}/preview?analytics=false`;
// Test card numbers to be used in gov.uk sandbox environment
// reference: https://docs.payments.service.gov.uk/testing_govuk_pay/#if-you-39-re-using-a-test-39-sandbox-39-account
const cards = {
  successful_card_number: "4444333322221111",
  invalid_card_number: "4000000000000002",
};

test.describe("Payment flow", async () => {
  const client = getClient();

  test.beforeAll(async () => {
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

  test("Should pay within GOV.UK Pay and reach the Confirmation page", async ({
    page,
  }) => {
    await navigateToPayComponent(page);
    await page.getByText("Pay using GOV.UK Pay").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
    const { payment_id: paymentRef } = await waitForPaymentResponse(page);
    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
  });

  test("Should retry and succeed a failed GOV.UK payment", async ({ page }) => {
    await navigateToPayComponent(page);

    await page.getByText("Pay using GOV.UK Pay").click();
    await fillGovUkCardDetails({ page, cardNumber: cards.invalid_card_number });
    await page.locator("#return-url").click();
    const { payment_id: failedPaymentRef } = await waitForPaymentResponse(page);
    expect(failedPaymentRef).toBeTruthy();

    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
    const { payment_id: paymentRef } = await waitForPaymentResponse(page);
    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
  });

  test("Should retry and succeed a cancelled GOV.UK payment", async ({
    page,
  }) => {
    await navigateToPayComponent(page);

    await page.getByText("Pay using GOV.UK Pay").click();
    await page.locator("#cancel-payment").click();
    await page.locator("#return-url").click();
    const { payment_id: failedPaymentRef, state } =
      await waitForPaymentResponse(page);

    expect(failedPaymentRef).toBeTruthy();
    expect(state.status).toBe("failed");

    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
    const { payment_id: paymentRef } = await waitForPaymentResponse(page);

    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
  });
});

async function fillGovUkCardDetails({
  page,
  cardNumber,
}: {
  page: Page;
  cardNumber: string;
}) {
  await page.locator("#card-no").fill(cardNumber);
  await page.getByLabel("Month").fill("12");
  await page.getByLabel("Year").fill("2099");
  await page.getByLabel("Name on card").fill("Test t Test");
  await page.getByLabel("Card security code", { exact: false }).fill("123");

  await page.locator("#address-line-1").fill("Test");
  await page.locator("#address-line-2").fill("123");

  await page.getByLabel("Town or city").fill("Test");
  await page.getByLabel("Postcode").fill("HP111BB");
  await page
    .getByLabel("Email")
    .fill("simulate-delivered@notifications.service.gov.uk");
  await page.locator("button#submit-card-details").click();
}

async function navigateToPayComponent(page: Page) {
  await page.goto(previewURL);
  await page.getByLabel("Pay test").fill("Test");
  await page.getByTestId("continue-button").click();
}

async function waitForPaymentResponse(page: Page): Promise<null | object> {
  return await page
    .waitForResponse((response) => {
      return response.url().includes(`pay/${TEAM_SLUG}`);
    })
    .then((req) => req.json());
}
