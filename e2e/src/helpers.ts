import { mockOSPlacesResponse } from "./mocks/osPlacesResponse";
import { expect } from "@playwright/test";
import type { Page, Browser, Locator } from "@playwright/test";
import { findSessionId, generateAuthenticationToken } from "./context";
import type { Context } from "./context";
import { getGraphQLClient } from "./context";
import { gql } from "graphql-request";
import { FlowGraph } from "@opensystemslab/planx-core/types";

// Test card numbers to be used in gov.uk sandbox environment
// reference: https://docs.payments.service.gov.uk/testing_govuk_pay/#if-you-39-re-using-a-test-39-sandbox-39-account
export const cards = {
  successful_card_number: "4444333322221111",
  invalid_card_number: "4000000000000002",
};

// utility functions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(...args: any[]) {
  process.env.DEBUG_LOG && console.log(...args);
}

// a collection of useful playwright actions
// these could evolve into fixtures: https://playwright.dev/docs/test-fixtures

export function debugPageConsole(page: Page) {
  page.on("console", (msg) => console.log(msg.text()));
}

// used to detect `{ "setItem": ... }`, `{"getItem": ... }`
// and "section state updated" debug messages on state transitions
export async function waitForDebugLog(page: Page) {
  return new Promise((resolve) => {
    page.on("console", (msg) => {
      if (msg.type() == "debug") {
        resolve(true);
      }
    });
  });
}

export async function createAuthenticatedSession({
  browser,
  userId,
}: {
  browser: Browser;
  userId: number;
}): Promise<Page> {
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  const token = generateAuthenticationToken(`${userId}`);
  await browserContext.addCookies([
    {
      name: "jwt",
      domain: "localhost",
      path: "/",
      value: token,
    },
  ]);
  return page;
}

export async function getAdminPage({
  browser,
  userId,
}: {
  browser: Browser;
  userId: number;
}): Promise<Page> {
  const page = await createAuthenticatedSession({ browser, userId });
  await page.goto("/");
  await page.waitForResponse((response) => {
    return response.url().includes("/graphql");
  });
  return page;
}

export async function getTeamPage({
  browser,
  userId,
  teamName,
}: {
  browser: Browser;
  userId: number;
  teamName: string;
}): Promise<Page> {
  const page = await getAdminPage({ browser, userId });
  await page.locator("h2", { hasText: teamName }).click();
  return page;
}

export async function saveSession({
  page,
  context,
}: {
  page: Page;
  context: Context;
}): Promise<string | undefined> {
  const pageResponsePromise = page.waitForResponse((response) => {
    return response.url().includes("/send-email/save");
  });
  await page
    .locator("button", { hasText: "Save and return to this application later" })
    .click();
  await pageResponsePromise;
  const adminGQLClient = getGraphQLClient();
  const sessionId = await findSessionId(adminGQLClient, context);
  return sessionId;
}

export async function returnToSession({
  page,
  context,
  sessionId,
  shouldContinue = true,
}: {
  page: Page;
  context: Context;
  sessionId: string;
  shouldContinue?: boolean;
}) {
  const returnURL = `/${context.team?.slug}/${context.flow?.slug}/preview?analytics=false&sessionId=${sessionId}`;
  log(`returning to http://localhost:3000/${returnURL}`);
  await page.goto(returnURL, { waitUntil: "load" });
  await page.locator("#email").fill(context.user?.email);
  if (shouldContinue) {
    const waitPromise = page.waitForResponse((response) => {
      return response.url().includes("/validate-session");
    });
    await clickContinue({ page });
    await waitPromise;
  }
}

export async function clickContinue({
  page,
  waitForLogEvent = false,
  waitForResponse = false,
}: {
  page: Page;
  waitForResponse?: boolean;
  waitForLogEvent?: boolean;
}) {
  if (waitForLogEvent || waitForResponse) {
    const waitPromise = waitForResponse
      ? page.waitForResponse((response) => {
          return response.url().includes("/graphql");
        })
      : waitForDebugLog(page); // assume debug message is triggered on state transition
    await page.getByTestId("continue-button").click();
    await waitPromise;
  } else {
    await page.getByTestId("continue-button").click();
  }
}

export async function clickBack({ page }: { page: Page }) {
  const waitPromise = waitForDebugLog(page); // assume debug message is triggered on state transition
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await waitPromise;
}

export async function fillInEmail({
  page,
  context,
}: {
  page: Page;
  context: Context;
}) {
  await page.locator("#email").fill(context.user.email);
  await page.locator("#confirmEmail").fill(context.user.email);
}

export async function findQuestion({
  page,
  title,
}: {
  page: Page;
  title: string;
}): Promise<Locator> {
  const group = await page.getByRole("group", { name: title });
  await expect(group).toBeVisible();
  return group;
}

export async function answerQuestion({
  page,
  title,
  answer,
}: {
  page: Page;
  title: string;
  answer: string;
}) {
  const group = await findQuestion({ page, title });
  await group.getByRole("button", { name: answer }).click();
}

export async function answerChecklist({
  page,
  title,
  answers,
}: {
  page: Page;
  title: string;
  answers: string[];
}) {
  const checklist = await page.getByRole("heading").filter({
    hasText: title,
  });
  await expect(checklist).toBeVisible();
  for (const answer of answers) {
    await page.locator("label", { hasText: answer }).click();
  }
}

export async function expectNotice({
  page,
  text,
}: {
  page: Page;
  text: string;
}) {
  const notice = await page.locator("h3", { hasText: text });
  await expect(notice).toBeVisible();
}

export async function expectConfirmation({
  page,
  text,
}: {
  page: Page;
  text: string;
}) {
  const confirmation = await page.locator("h1", { hasText: text });
  await expect(confirmation).toBeVisible();
}

export async function expectSections({
  page,
  sections,
}: {
  page: Page;
  sections: {
    title: string;
    status: string;
  }[];
}) {
  const pageSections = await page.locator("dl > dt");
  const pageStatuses = await page.locator("dl > dd");
  await expect(pageSections).toContainText(sections.map((s) => s.title));
  await expect(pageStatuses).toContainText(sections.map((s) => s.status));
}

export async function getSessionId(page: Page): Promise<string> {
  // the session id is not available in the url so find it in a test utility component
  const sessionId: string | null = await page
    .getByTestId("sessionId")
    .getAttribute("data-sessionid");
  if (!sessionId) throw new Error("Session ID not found on page");
  return sessionId!;
}

export async function fillGovUkCardDetails({
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

export async function answerFindProperty(page: Page) {
  await setupOSMockResponse(page);
  await page.getByLabel("Postcode").fill("SW1 1AA");
  await page.getByLabel("Select an address").click();
  await page.getByRole("option").first().click();
}

async function setupOSMockResponse(page: Page) {
  const ordnanceSurveryPlacesEndpoint = new RegExp(
    /proxy\/ordnance-survey\/search\/places\/v1\/postcode\/*/
  );
  await page.route(ordnanceSurveryPlacesEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(mockOSPlacesResponse),
    });
  });
}

export async function answerContactInput(
  page: Page,
  {
    firstName,
    lastName,
    phoneNumber,
    email,
  }: { firstName: string; lastName: string; phoneNumber: string; email: string }
) {
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill(lastName);
  await page.getByLabel("Phone number").fill(phoneNumber);
  await page.getByLabel("Email address").fill(email);
}

export async function setFeatureFlag(page: Page, featureFlag: string) {
  await page.addInitScript(
    (featureFlag: string) =>
      window.localStorage.setItem(
        "FEATURE_FLAGS",
        JSON.stringify([featureFlag])
      ),
    featureFlag
  );
}

export async function getSessionIdFromURL(page: Page): Promise<string> {
  const url = await new URL(page.url());
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId)
    throw Error("Session ID missing from page. URL " + url.toString());
  return sessionId;
}

export async function addSessionToContext(page: Page, context: Context) {
  const sessionId = await getSessionIdFromURL(page);
  await context.sessionIds!.push(sessionId);
  return sessionId;
}

export async function waitForPaymentResponse(
  page: Page,
  context: Context
): Promise<{ paymentId: string; state?: { status: string } }> {
  const { payment_id: paymentId, state } = await page
    .waitForResponse((response) => {
      return response.url().includes(`pay/${context.team!.slug!}`);
    })
    .then((req) => req.json());
  if (!paymentId) throw new Error("Bad payment response");
  return { paymentId, state };
}

export async function modifyFlow({
  context,
  modifiedFlow,
}: {
  context: Context;
  modifiedFlow: FlowGraph;
}) {
  const adminGQLClient = getGraphQLClient();
  if (!context.flow?.id || !context.user?.id) {
    throw new Error("context must have a flow and user");
  }
  await adminGQLClient.request(
    gql`
      mutation UpdateTestFlow($flowId: uuid!, $userId: Int!, $data: jsonb!) {
        update_flows_by_pk(pk_columns: { id: $flowId }, _set: { data: $data }) {
          id
          data
        }
        insert_published_flows_one(
          object: { flow_id: $flowId, data: $data, publisher_id: $userId }
        ) {
          id
        }
      }
    `,
    {
      flowId: context.flow!.id,
      userId: context.user!.id,
      data: modifiedFlow,
    }
  );
}
