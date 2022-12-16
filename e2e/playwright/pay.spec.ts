import { test, expect, type Page } from "@playwright/test";
import { gqlAdmin, insertTestUser } from "./utils";

import publishedFlow from "./assets/payFlowPublishedFlow.json";

const URL = "http://localhost:3000";
const TEAM_SLUG = "buckinghamshire";
const FLOW_SLUG = "pay-test";

// Test card numbers to be used in gov.uk sandbox environment
// reference: https://docs.payments.service.gov.uk/testing_govuk_pay/#if-you-39-re-using-a-test-39-sandbox-39-account
const SUCCESS_CARD_NUMBER = "4444333322221111";
const INVALID_CARD_NUMBER = "4000000000000002";

test.describe("Payment flow", async () => {
  const USER_EMAIL = "test@test.com";

  let userId = 0;
  let teamId = 0;
  let flowId = "";
  let publishedFlowId = "";

  test.beforeEach(async () => {
    userId = await insertTestUser(USER_EMAIL);
    teamId = await createTeam(TEAM_SLUG);
    flowId = await createFlow({ teamId, flowSlug: FLOW_SLUG });
    publishedFlowId = await insertPublishedFlow({ flowId });
  });

  test.afterEach(async () => {
    const analyticsIds = await getAnalyticsByFlowId(flowId);
    await deleteTestData({
      teamId,
      flowId,
      publishedFlowId,
      userId,
      analyticsIds,
    });
  });

  test("Should pay within GOV.UK Pay and reach the Confirmation page", async ({
    page,
  }) => {
    await navigateToPayComponent({ page, mode: "preview" });

    await page.getByText("Pay using GOV.UK Pay").click();

    await fillGovUkCardDetails(page)(SUCCESS_CARD_NUMBER);
    await page.locator("#confirm").click();
    const paymentRef = await awaitForPaymentResponse(page);

    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
  });

  test("Should retry and succeed a failed GOV.UK payment", async ({ page }) => {
    await navigateToPayComponent({ page, mode: "preview" });

    await page.getByText("Pay using GOV.UK Pay").click();

    await fillGovUkCardDetails(page)(INVALID_CARD_NUMBER);
    await page.locator("#return-url").click();
    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails(page)(SUCCESS_CARD_NUMBER);
    await page.locator("#confirm").click();
    const paymentRef = await awaitForPaymentResponse(page);

    expect(paymentRef).toBeTruthy();
    expect(await page.getByText(paymentRef!).textContent()).toBeTruthy();
  });
});

function fillGovUkCardDetails(page: Page) {
  return async (cardNumber: string) => {
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
    await page.waitForLoadState("networkidle");

    // GOV.UK Pay submit button is actionable but if there is no delay here the click is ignored
    await page.locator("button#submit-card-details").click({
      delay: 1000,
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
  await page.goto(`${URL}/${TEAM_SLUG}/${FLOW_SLUG}/${mode}?analytics=false`);

  await page.getByLabel("Pay test").fill("Test");
  await page.getByTestId("continue-button").click();
}

async function awaitForPaymentResponse(page: Page) {
  let paymentRef: string | undefined;

  await page.waitForResponse((resp) => {
    if (resp.url().includes(`pay/${TEAM_SLUG}/`) && resp.ok()) {
      paymentRef = resp.url().split("/").pop();
      return true;
    }
    return false;
  });

  return paymentRef;
}

async function createFlow({
  teamId,
  flowSlug,
}: {
  teamId: number;
  flowSlug: string;
}) {
  const {
    data: { insert_flows_one },
  } = await gqlAdmin(
    `
      mutation CreateFlow($teamId: Int!, $flowSlug: String!) {
        insert_flows_one(object: { team_id: $teamId, slug: $flowSlug }) {
          id
        }
      }
    `,
    {
      teamId: teamId,
      flowSlug: flowSlug,
    }
  );

  return insert_flows_one.id;
}

async function createTeam(slug: string) {
  const {
    data: { insert_teams_one },
  } = await gqlAdmin(
    `
      mutation CreateTeam ($slug: String!) {
        insert_teams_one(object: { name: $slug, slug: $slug }) {
          id
        }
      }
    `,
    {
      slug: slug,
    }
  );
  return insert_teams_one.id;
}

async function getAnalyticsByFlowId(flowId: string): Promise<number[]> {
  const {
    data: { analytics },
  } = await gqlAdmin(
    `
      query Analytics($flowIds: [uuid!]!) {
      analytics(where: { flow_id: { _in: $flowIds } }) {
          id
        }
      }
    `,
    {
      flowIds: [flowId],
    }
  );

  return analytics?.map(({ id }) => id) || [];
}

async function insertPublishedFlow({ flowId }: { flowId: string }) {
  const {
    data: { insert_published_flows_one },
  } = await gqlAdmin(
    `
      mutation InsertPublishedFlow(
        $publishedFlow: published_flows_insert_input!,
      ) {
        insert_published_flows_one(
          object: $publishedFlow
        ) {
          id
        }
      }
    `,
    {
      publishedFlow: { ...publishedFlow, flow_id: flowId },
    }
  );

  return insert_published_flows_one.id;
}

async function deleteTestData({
  teamId,
  flowId,
  publishedFlowId,
  userId,
  analyticsIds,
}: {
  teamId: number;
  flowId: string;
  publishedFlowId: string;
  userId: number;
  analyticsIds: number[];
}) {
  await gqlAdmin(
    `
      mutation DeleteTestRegisters(
        $teams: [Int!]!,
        $flows: [uuid!]!,
        $publishedFlows: [Int!]!,
        $userIds: [Int!]!,
        $analyticsIds: [bigint!]!
      ) {
        delete_analytics_logs(where: { analytics_id: { _in: $analyticsIds } }) {
          affected_rows
        }
        delete_analytics(where: { id: { _in: $analyticsIds } }) {
          affected_rows
        }
        delete_session_backups(where: { flow_id: { _in: $flows } }){
          affected_rows
        }
        delete_published_flows(where: { id: { _in: $publishedFlows } }) {
          affected_rows
        }
        delete_flows(where: { id: { _in: $flows } }) {
          affected_rows
        }
        delete_teams(where: { id: { _in: $teams } }) {
          affected_rows
        }
        delete_users(where: { id: { _in: $userIds } }) {
          affected_rows
        }
      }
    `,
    {
      teams: [teamId],
      flows: [flowId],
      publishedFlows: [publishedFlowId],
      userIds: [userId],
      analyticsIds: analyticsIds,
    }
  );
}
