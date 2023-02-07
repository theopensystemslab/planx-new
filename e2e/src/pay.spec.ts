import { test, expect } from "@playwright/test";
import { log } from "./helpers";
import type { Page } from "@playwright/test";
import payFlow from "./flows/pay-flow.json";
import { getClient, setUpTestContext, tearDownTestContext } from "./context";
import { waitForPaymentResponse } from "./payUtils/awaitForPaymentResponse";
import { fillGovUkCardDetails } from "./payUtils/fillGovUkCardDetails";
import { cards } from "./constants";
import Client from "planx-client";

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
    const { payment_id: paymentRef } = await waitForPaymentResponse({
      page,
      teamSlug: TEAM_SLUG,
    });
    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentRef,
        client,
      })
    ).toBe(true);
  });

  test("Should retry and succeed a failed GOV.UK payment", async ({ page }) => {
    await navigateToPayComponent(page);

    await page.getByText("Pay using GOV.UK Pay").click();
    await fillGovUkCardDetails({ page, cardNumber: cards.invalid_card_number });
    await page.locator("#return-url").click();
    const { payment_id: failedPaymentRef } = await waitForPaymentResponse({
      page,
      teamSlug: TEAM_SLUG,
    });
    expect(failedPaymentRef).toBeTruthy();
    expect(
      await hasPaymentStatus({
        status: "failed",
        paymentId: failedPaymentRef,
        client,
      })
    ).toBe(true);

    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
    const { payment_id: paymentRef } = await waitForPaymentResponse({
      page,
      teamSlug: TEAM_SLUG,
    });
    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentRef,
        client,
      })
    ).toBe(true);
  });

  test("Should retry and succeed a cancelled GOV.UK payment", async ({
    page,
  }) => {
    await navigateToPayComponent(page);

    await page.getByText("Pay using GOV.UK Pay").click();
    await page.locator("#cancel-payment").click();
    await page.locator("#return-url").click();
    const { payment_id: failedPaymentRef, state } =
      await waitForPaymentResponse({ page, teamSlug: TEAM_SLUG });

    expect(failedPaymentRef).toBeTruthy();
    expect(state.status).toBe("failed");
    expect(
      await hasPaymentStatus({
        status: "failed",
        paymentId: failedPaymentRef,
        client,
      })
    ).toBe(true);

    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
    const { payment_id: paymentRef } = await waitForPaymentResponse({
      page,
      teamSlug: TEAM_SLUG,
    });

    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentRef,
        client,
      })
    ).toBe(true);
  });
});

async function navigateToPayComponent(page: Page) {
  await page.goto(previewURL);
  await page.getByLabel("Pay test").fill("Test");
  await page.getByTestId("continue-button").click();
}

async function hasPaymentStatus({
  status,
  paymentId,
  client,
}: {
  status: string;
  paymentId: string;
  client: Client;
}): Promise<boolean> {
  try {
    const { payment_status: response } = await client.request(
      `query GetPaymentStatus($paymentId: String!, $status: payment_status_enum_enum!) {
        payment_status(where: {payment_id: {_eq: $paymentId}, status: {_eq: $status}}) {
          status
        }
      }`,
      { paymentId, status }
    );
    if (response.length === 1 && response[0].status) {
      return response[0].status === status;
    }
  } catch (e) {
    log(`Payment status not found:`, e);
  }
  return false;
}
