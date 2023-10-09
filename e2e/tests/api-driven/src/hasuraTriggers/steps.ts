import { After, Given, Then, When, World } from "@cucumber/cucumber";
import { cleanup } from "./helpers";
import { User } from "@opensystemslab/planx-core/types";
import { $admin } from "../client";
import assert from "assert";
import { createTeam, createUser } from "../globalHelpers";

export class CustomWorld extends World {
  user!: User;
  templatesTeamId!: number;
}

After("@add-user-trigger", async function () {
  await cleanup();
});

Given("the Templates team exists", async function (this) {
  const templatesTeamId = await createTeam({ slug: "templates" });

  assert.ok(templatesTeamId, "Templates team is not defined");

  this.templatesTeamId = templatesTeamId;
});

When<CustomWorld>("a new user is added", async function (this) {
  const userId = await createUser();
  const user = await $admin.user.getById(userId);

  assert.ok(user, "User is not defined");

  this.user = user;
});

Then<CustomWorld>(
  "they are granted access to the Templates team",
  async function (this) {
    assert.strictEqual(this.user.teams.length, 1);
    assert.strictEqual(this.user.teams[0].team.slug, "templates");
    assert.strictEqual(this.user.teams[0].team.id, this.templatesTeamId);
  },
);

Then<CustomWorld>("have the teamEditor role", async function (this) {
  assert.strictEqual(this.user.teams[0].role, "teamEditor");
});

Then<CustomWorld>(
  "they are not granted access to the Templates team",
  async function (this) {
    assert.strictEqual(this.user.teams.length, 0);
  },
);
