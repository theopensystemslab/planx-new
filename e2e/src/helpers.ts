import { expect } from "@playwright/test";
import type { Page, Browser, Locator } from "@playwright/test";
import { findSessionId, generateAuthenticationToken } from "./context";
import type { Context } from "./context";
import type { GraphQLClient } from "graphql-request";

// utility functions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(...args: any[]) {
  process.env.DEBUG_LOG && console.log(...args);
}

// a collection of useful playwright actions
// these could evolve into fixtures: https://playwright.dev/docs/test-fixtures

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
  adminGQLClient,
  context,
}: {
  page: Page;
  adminGQLClient: GraphQLClient;
  context: Context;
}): Promise<string | undefined> {
  // ensure store has had time to update any previous answer before saving
  await new Promise((resolve) => setTimeout(resolve, 500));

  await page
    .locator("button", { hasText: "Save and return to this application later" })
    .click();
  await page.waitForResponse((response) => {
    return response.url().includes("/send-email/save");
  });
  const sessionId = await findSessionId(adminGQLClient, context);
  return sessionId;
}

export async function returnToSession({
  page,
  context,
  sessionId,
}: {
  page: Page;
  context: Context;
  sessionId: string;
}) {
  const returnURL = `/${context.team?.slug}/${context.flow?.slug}/preview?analytics=false&sessionId=${sessionId}`;
  await page.goto(returnURL, { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(context.user?.email);
}

export async function clickContinue({
  page,
  waitForResponse = false,
}: {
  page: Page;
  waitForResponse?: boolean;
}) {
  await page.getByTestId("continue-button").click();
  if (waitForResponse) {
    await page.waitForResponse(
      (response) =>
        response.url().includes("graphql") && response.status() === 200
    );
  }
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
