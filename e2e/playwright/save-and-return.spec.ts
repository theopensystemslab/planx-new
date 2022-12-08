import assert from "node:assert";
import { test, expect } from "@playwright/test";
import Client from "planx-client";
import simpleSendFlow from "./simple-send-flow.json";

assert(process.env.EDITOR_URL_EXT);
assert(process.env.HASURA_GRAPHQL_URL);
assert(process.env.HASURA_GRAPHQL_ADMIN_SECRET);

test.describe("Save and return", () => {
  const client = new Client({
    hasuraSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
    targetURL: process.env.HASURA_GRAPHQL_URL!,
  });

  let context: any;
  test.beforeAll(async () => {
    context = await setupTestContext(client)
  });

  test.afterAll(async () => {
    await deleteTestContext(client, context);
  });

  test("email confirmation is required", async ({ page }) => {
      await page.goto(context.flowPreviewURL);
      await page.waitForEvent('popup'),

      await page.locator("#email").fill(context.user.email);
      await page.getByTestId('continue-button').click();
      await expect(page.locator('.status')).toHaveText('Email address required');
  });
});

async function setupTestContext(client) {
  const context: any = {
    user: { 
      firstName: "test",
      lastName: "test",
      email: "e2etest1@test.com"
    },
    team: { 
      name: "E2E Test Team",
      slug: "e2e-test-team",
      logo: "https://placedog.net/250/250",
      primaryColor: "#F30415",
      homepage: "example.com",
    },
    flow: {
      slug: "e2e-save-and-return-test-flow1",
      data: simpleSendFlow,
    },
  };
  context.user.id = await client.createUser(context.user);
  context.team.id = await client.createTeam(context.team);
  context.flow.id = await client.createFlow({
    slug: context.flow.slug,
    teamId: context.team.id,
    data: context.flow.data,
  });
  context.flow.publishedID = await client.publishFlow({
    flow: context.flow,
    publisherId: context.user.id,
  });
  const editorURL = process.env.EDITOR_URL_EXT!;
  context.flowPreviewURL = `${editorURL}/${context.team.slug}/${context.flow.slug}/preview?analytics=false`
  return context;
}

async function deleteTestContext(client, context) {
  if (context.flow.publishedID) {
    await client.request(
      `mutation DeleteTestPublishedFlow( $publishedFlowID: Int!) {
        delete_published_flows_by_pk(id: $publishedFlowID) {
          id
        }
      }`,
      { publishedFlowID: context.flow.publishedID }
    )
  }
  if (context.flow.id) {
    await client.request(
      `mutation DeleteTestFlow( $flowID: uuid!) {
        delete_flows_by_pk(id: $flowID) {
          id
        }
      }`,
      { flowID: context.flow.id }
    )
  }
  if (context.team.id) {
    await client.request(
      `mutation DeleteTestTeam($teamID: Int!) {
        delete_teams_by_pk(id: $teamID) {
          id
        }
      }`,
      { teamID: context.team.id} 
    )
  }
  if (context.user.id) {
    await client.request(
      `mutation DeleteTestUser($userID: Int!) {
        delete_users_by_pk(id: $userID) {
          id
        }
      }`,
      { userID: context.user.id }
    )
  }
}
