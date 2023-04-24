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
  const text = "Save and return to this application later";
  await page.locator(`button :has-text("${text}")`).click();
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
  await page.goto(returnURL);
  await page.locator("#email").fill(context.user?.email);
  await page.getByTestId("continue-button").click();
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
  await page.getByTestId("continue-button").click();
}

export async function findQuestionGroup({
  page,
  questionGroup,
}: {
  page: Page;
  questionGroup: string;
}): Promise<Locator> {
  return await page.getByRole("group", {
    name: questionGroup,
  });
}

export async function answerQuestion({
  page,
  questionGroup,
  answer,
}: {
  page: Page;
  questionGroup: string;
  answer: string;
}) {
  const group = await findQuestionGroup({ page, questionGroup });
  await group.getByRole("button", { name: answer }).click();
  await page.getByTestId("continue-button").click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("graphql") && response.status() === 200
  );
}
