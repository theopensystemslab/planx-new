import { Browser, Locator, Page, Request } from "@playwright/test";
import { createAuthenticatedSession } from "../globalHelpers";

export const isGetUserRequest = (req: Request) =>
  req.url().includes("/user/me");

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
  await page.locator("h3", { hasText: teamName }).click();
  return page;
}

export const createQuestionWithOptions = async (
  page: Page,
  locatingNodeSelector: string,
  questionText: string,
  options: string[]
) => {
  await page.locator(locatingNodeSelector).click();
  await page.getByRole("dialog").waitFor();
  await page.getByPlaceholder("Text").fill(questionText);

  let index = 0;
  for (const option of options) {
    await page.locator("button").filter({ hasText: "add new" }).click();
    await page.getByPlaceholder("Option").nth(index).fill(option);
    index++;
  }

  await page.locator("button").filter({ hasText: "Create question" }).click();
};

export const createNotice = async (
  page: Page,
  locatingNode: Locator,
  noticeText: string
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: "Notice" });
  await page.getByPlaceholder("Notice").fill(noticeText);
  await page.locator("button").filter({ hasText: "Create notice" }).click();
};
