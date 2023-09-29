import { After, Before, Given, Then, When, World } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { getUser } from "../globalHelpers";
import {
  Action,
  Table,
  addUserToTeam,
  cleanup,
  performGQLQuery,
  setup,
} from "./helpers";

export class CustomWorld extends World {
  user1Id!: number;
  user1Email!: string;
  team1Id!: number;
  team1FlowId!: string;

  team2Id!: number;
  user2Id!: number;
  user2Email!: string;
  team2FlowId!: string;

  activeUserId!: number;
  activeUserEmail!: string;

  error?: Error = undefined;
  result: any[] | Record<"returning", any[]> | null = null;
}

Before<CustomWorld>("@team-admin-permissions", async function () {
  const { user1Id, teamId1, team1FlowId, user2Id, teamId2, team2FlowId } =
    await setup();
  this.user1Id = user1Id;
  this.user1Email = "e2e-user-1@example.com";
  this.team1Id = teamId1;
  this.team1FlowId = team1FlowId;

  this.user2Id = user2Id;
  this.user2Email = "e2e-user-2@example.com";
  this.team2Id = teamId2;
  this.team2FlowId = team2FlowId;
});

After("@team-admin-permissions", async function () {
  await cleanup();
});

Given("a teamAdmin from team1", async function (this: CustomWorld) {
  await addUserToTeam(this.user1Id, this.team1Id);
  const user = await getUser(this.user1Email);

  assert.ok(user, "User is not defined");
  assert.strictEqual(user.teams.length, 1);
  assert.strictEqual(user.teams[0].role, "teamEditor");
  assert.strictEqual(user.teams[0].team.id, this.team1Id);

  this.activeUserId = this.user1Id;
  this.activeUserEmail = this.user1Email;
});

Given("a teamAdmin from team2", async function (this: CustomWorld) {
  await addUserToTeam(this.user2Id, this.team2Id);
  const user = await getUser(this.user2Email);

  assert.ok(user, "User is not defined");
  assert.strictEqual(user.teams.length, 1);
  assert.strictEqual(user.teams[0].role, "teamEditor");
  assert.strictEqual(user.teams[0].team.id, this.team2Id);

  this.activeUserId = this.user1Id;
  this.activeUserEmail = this.user1Email;
});

When(
  "they perform {string} on team1's {string}",
  async function (this: CustomWorld, action: Action, table: Table) {
    try {
      this.result = await performGQLQuery({
        world: this,
        action,
        table,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.error = error;
        return;
      }
      throw error;
    }
  },
);

When(
  "they perform {string} on themselves in {string}",
  async function (this: CustomWorld, action: Action, table: Table) {
    try {
      this.result = await performGQLQuery({
        world: this,
        action,
        table,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.error = error;
        return;
      }
      throw error;
    }
  },
);

When(
  "they perform {string} on a different user in {string}",
  async function (this: CustomWorld, action: Action, table: Table) {
    try {
      this.result = await performGQLQuery({
        world: {
          ...this,
          // Point query to a different user
          user1Id: this.user2Id,
        },
        action,
        table,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.error = error;
        return;
      }
      throw error;
    }
  },
);

Then("they have access", function (this: CustomWorld) {
  if (!this.result) {
    assert.fail("Permission should have been granted - check test setup");
  } else if (this.error) {
    assert.fail(`Permission query failed with error: ${this.error.message}`);
  }
});

Then("they do not have access", function (this: CustomWorld) {
  const isResultEmpty = Array.isArray(this.result) && !this.result.length;
  const isResultSetEmpty =
    this.result && !Array.isArray(this.result) && !this.result.returning.length;

  if (isResultEmpty || isResultSetEmpty) {
    assert.ok(`Permission query did not return results`);
  } else if (this.error) {
    assert.ok(`Permission query failed with error: ${this.error.message}`);
  } else if (this.result) {
    assert.fail("Permission should not have been granted - check test setup");
  }
});
