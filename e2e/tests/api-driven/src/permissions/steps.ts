import { After, Before, Given, Then, When, World } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { getUser } from "../globalHelpers";
import { addUserToTeam, cleanup, performGQLQuery, setup } from "./helpers";

interface TestUser {
  id: number;
  email: string;
}

export class CustomWorld extends World {
  user1!: TestUser;
  user2!: TestUser;
  teamId1!: number;
  teamId2!: number;
  team1Flow!: string;
  team2Flow!: string;
  error?: Error = undefined;
  activeUser!: TestUser;
}

Before<CustomWorld>("@team-admin-permissions", async function () {
  const { user1, user2, teamId1, teamId2, team1Flow, team2Flow } =
    await setup();
  this.user1 = user1;
  this.user2 = user2;
  this.teamId1 = teamId1;
  this.teamId2 = teamId2;
  this.team1Flow = team1Flow;
  this.team2Flow = team2Flow;
});

After("@team-admin-permissions", async function () {
  await cleanup();
});

Given("a teamAdmin is a member of a team", async function (this: CustomWorld) {
  await addUserToTeam(this.user1.id, this.teamId1);
  const user = await getUser(this.user1.email);

  assert.ok(user, "User is not defined");
  assert.strictEqual(user.teams.length, 1);
  assert.strictEqual(user.teams[0].role, "teamEditor");
  assert.strictEqual(user.teams[0].team.id, this.teamId1);

  this.activeUser = this.user1;
});

Given(
  "a teamAdmin is not in the requested team",
  async function (this: CustomWorld) {
    await addUserToTeam(this.user2.id, this.teamId2);
    const user = await getUser(this.user2.email);

    assert.ok(user, "User is not defined");
    assert.strictEqual(user.teams.length, 1);
    assert.strictEqual(user.teams[0].role, "teamEditor");
    assert.strictEqual(user.teams[0].team.id, this.teamId2);

    this.activeUser = this.user2;
  },
);

When(
  "they perform {string} on {string}",
  async function (this: CustomWorld, action: string, table: string) {
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
