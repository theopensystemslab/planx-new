import { After, Before, Given, Then, When, World } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { getUser } from "../globalHelpers";
import { Action, Table, addUserToTeam, cleanup, performGQLQuery, setup } from "./helpers";

export class CustomWorld extends World {
  user1Id!: number;
  user1Email!: string;
  team1Id!: number;
  team1FlowId!: string;

  team2Id!: number;
  user2Id!: number;
  user2Email!: string;
  team2FlowId!: string;
  
  error?: Error = undefined;

  activeUserId!: number;
  activeUserEmail!: string;
}

Before<CustomWorld>("@team-admin-permissions", async function () {
  const { 
    user1Id, 
    teamId1, 
    team1FlowId, 
    user2Id, 
    teamId2, 
    team2FlowId 
  } = await setup();
  this.user1Id = user1Id;
  this.user1Email = "e2e-user-1@opensystemslab.io";
  this.team1Id = teamId1;
  this.team1FlowId = team1FlowId;
  
  this.user2Id = user2Id;
  this.user2Email = "e2e-user-2@opensystemslab.io";
  this.team2Id = teamId2;
  this.team2FlowId = team2FlowId;
});

After("@team-admin-permissions", async function () {
  await cleanup();
});

Given("a teamAdmin is a member of a team", async function (this: CustomWorld) {
  await addUserToTeam(this.user1Id, this.team1Id);
  const user = await getUser(this.user1Email);

  assert.ok(user, "User is not defined");
  assert.strictEqual(user.teams.length, 1);
  assert.strictEqual(user.teams[0].role, "teamEditor");
  assert.strictEqual(user.teams[0].team.id, this.team1Id);

  this.activeUserId = this.user1Id;
  this.activeUserEmail = this.user1Email;
});

Given(
  "a teamAdmin is not in the requested team",
  async function (this: CustomWorld) {
    await addUserToTeam(this.user2Id, this.team2Id);
    const user = await getUser(this.user2Email);

    assert.ok(user, "User is not defined");
    assert.strictEqual(user.teams.length, 1);
    assert.strictEqual(user.teams[0].role, "teamEditor");
    assert.strictEqual(user.teams[0].team.id, this.team2Id);

    this.activeUserId = this.user1Id;
    this.activeUserEmail = this.user1Email;
  },
);

When(
  "they perform {string} on {string}",
  async function (this: CustomWorld, action: Action, table: Table) {
    try {
      await performGQLQuery({
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

Then("they have access", function (this: CustomWorld) {
  if (this.error) {
    assert.fail(`Permission query failed with error: ${this.error.message}`);
  }
});

Then("they do not have access", function (this: CustomWorld) {
  if (this.error) {
    assert.ok(`Permission query failed with error: ${this.error.message}`);
  }
});
