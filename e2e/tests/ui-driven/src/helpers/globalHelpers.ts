import { FlowGraph } from "@opensystemslab/planx-core/types";
import type { Browser, Page, Request } from "@playwright/test";
import { gql } from "graphql-request";
import type { Context } from "./context";
import { generateAuthenticationToken, getGraphQLClient } from "./context";

// Test card numbers to be used in gov.uk sandbox environment
// reference: https://docs.payments.service.gov.uk/testing_govuk_pay/#if-you-39-re-using-a-test-39-sandbox-39-account
export const cards = {
  successful_card_number: "4444333322221111",
  invalid_card_number: "4000000000000002",
};

// Gov.uk Notify requests testing service use smoke test email addresses
// see https://docs.notifications.service.gov.uk/rest-api.html#smoke-testing
export const TEST_EMAIL =
  "simulate-delivered@notifications.service.gov.uk" as const;

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
    {
      name: "auth",
      domain: "localhost",
      path: "/",
      value: JSON.stringify({ loggedIn: true }),
    },
  ]);
  return page;
}

export async function setFeatureFlag(page: Page, featureFlag: string) {
  await page.addInitScript(
    (featureFlag: string) =>
      window.localStorage.setItem(
        "FEATURE_FLAGS",
        JSON.stringify([featureFlag]),
      ),
    featureFlag,
  );
}

export async function getSessionId(page: Page): Promise<string> {
  // @ts-expect-error - Property api does not exist on type Window & typeof globalThis
  const sessionId = page.evaluate(() => window.api.getState().sessionId);
  if (!sessionId) throw Error("Session ID missing from window");
  return sessionId;
}

export async function addSessionToContext(page: Page, context: Context) {
  const sessionId = await getSessionId(page);
  context.sessionIds!.push(sessionId);
  return sessionId;
}

export async function waitForPaymentResponse(
  page: Page,
  context: Context,
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
  if (!context.flows?.[0]?.slug || !context.user?.id) {
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
      flowId: context.flows?.[0].id,
      userId: context.user!.id,
      data: modifiedFlow,
    },
  );
}
export const isGetUserRequest = (req: Request) =>
  req.url().includes("/user/me");
