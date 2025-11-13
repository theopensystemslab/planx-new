import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { findSessionId, getGraphQLClient } from "./context.js";
import { TEST_EMAIL, log, waitForDebugLog } from "./globalHelpers.js";
import { TestContext } from "./types.js";

export async function saveSession({
  page,
  context,
}: {
  page: Page;
  context: TestContext;
}): Promise<string | undefined> {
  const pageResponsePromise = page.waitForResponse((response) => {
    return response.url().includes("/send-email/save");
  });
  await page
    .locator("button", { hasText: "Save and return to this form later" })
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
  context: TestContext;
  sessionId: string;
  shouldContinue?: boolean;
}) {
  const returnURL = `/${context.team?.slug}/${context.flow?.slug}/published?analytics=false&sessionId=${sessionId}`;
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
  await page.getByTestId("backButton").click();
  await waitPromise;
}

export async function fillInEmail({
  page,
  context,
}: {
  page: Page;
  context: TestContext;
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
  const group = page.getByRole("radiogroup", { name: title });
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
  await group.getByRole("radio", { name: answer }).click();
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
  const checklist = page.getByRole("heading").filter({
    hasText: title,
  });
  await expect(checklist).toBeVisible();
  for (const answer of answers) {
    await page.getByLabel(answer, { exact: true }).click();
  }
}

export async function expectNotice({
  page,
  text,
}: {
  page: Page;
  text: string;
}) {
  const notice = page.locator("h1", { hasText: text });
  await expect(notice).toBeVisible();
}

export async function expectConfirmation({
  page,
  text,
}: {
  page: Page;
  text: string;
}) {
  const confirmation = page.locator("h1", { hasText: text });
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
  const pageSections = page.locator("ul li");
  const pageStatuses = page.locator("ul li span");
  await expect(pageSections).toContainText(sections.map((s) => s.title));
  await expect(pageStatuses).toContainText(sections.map((s) => s.status));
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
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.locator("button#submit-card-details").click();
}

export async function submitCardDetails(page: Page) {
  await page.locator("#confirm").click();
}

export async function answerContactInput(
  page: Page,
  {
    firstName,
    lastName,
    phoneNumber,
    email,
  }: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  },
) {
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill(lastName);
  await page.getByLabel("Phone number").fill(phoneNumber);
  await page.getByLabel("Email address").fill(email);
}

export async function answerTextInput(
  page: Page,
  {
    expectedQuestion,
    answer,
    continueToNext,
  }: {
    expectedQuestion: string;
    answer: string;
    continueToNext: boolean;
  },
) {
  await expect(page.locator("p", { hasText: expectedQuestion })).toBeVisible();
  await page.locator("label div input[type='text']").fill(answer);
  if (continueToNext) {
    await clickContinue({ page });
  }
}

export async function answerNumberInput(
  page: Page,
  {
    expectedQuestion,
    answer,
    continueToNext,
  }: {
    expectedQuestion: string;
    answer: number;
    continueToNext: boolean;
  },
) {
  await expect(page.locator("p", { hasText: expectedQuestion })).toBeVisible();
  await page.locator("label div input[type='number']").fill(answer.toString());
  if (continueToNext) {
    await clickContinue({ page });
  }
}

export async function answerDateInput(
  page: Page,
  {
    expectedQuestion,

    day,
    month,
    year,
    continueToNext,
  }: {
    expectedQuestion: string;

    day: number;
    month: number;
    year: number;
    continueToNext: boolean;
  },
) {
  await expect(page.locator("h1", { hasText: expectedQuestion })).toBeVisible();
  await page.getByRole("textbox", { name: "Day" }).fill(day.toString());
  await page.getByRole("textbox", { name: "Month" }).fill(month.toString());
  await page.getByRole("textbox", { name: "Year" }).fill(year.toString());

  if (continueToNext) {
    await clickContinue({ page });
  }
}

export async function answerAddressInput(
  page: Page,
  {
    expectedQuestion,

    addressLineOne,
    town,
    postcode,
    continueToNext,
  }: {
    expectedQuestion: string;

    addressLineOne: string;
    town: string;
    postcode: string;
    continueToNext: boolean;
  },
) {
  await expect(page.locator("h1", { hasText: expectedQuestion })).toBeVisible();
  await page.getByLabel("Address line 1").fill(addressLineOne);
  await page.getByLabel("Town").fill(town);
  await page.getByLabel("Postcode").fill(postcode);
  if (continueToNext) {
    await clickContinue({ page });
  }
}

export async function answerListInput(
  page: Page,
  {
    unitType,
    numUnits,
    tenure,
    numBedrooms,
    continueToNext,
  }: {
    unitType: string;
    numUnits: number;
    tenure: string;
    numBedrooms: number;
    continueToNext: boolean;
  },
) {
  await expect(
    page.locator("h2", { hasText: "Existing residential unit type 1" }),
  ).toBeVisible(); // assume the default list for now
  await page
    .getByRole("combobox", { name: "What best describes this unit?" })
    .click();
  await page.getByRole("option", { name: unitType, exact: true }).click();

  await page
    .getByLabel("How many identical units of this type are there?")
    .fill(numUnits.toString());

  await page
    .getByRole("combobox", {
      name: "Select how the unit is owned or rented",
    })
    .click();
  await page.getByRole("option", { name: tenure, exact: true }).click();

  await page
    .getByLabel("How many bedrooms does this unit have?")
    .fill(numBedrooms.toString());

  const saveButton = page.getByTestId("save-item-button");
  await saveButton.click();

  if (continueToNext) {
    await clickContinue({ page });
  }
}
