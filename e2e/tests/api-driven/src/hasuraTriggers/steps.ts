import { After, Given, Then, When, World } from "@cucumber/cucumber";
import { cleanup, createDemoUser } from "./helpers.js";
import { User } from "@opensystemslab/planx-core/types";
import { $admin } from "../client.js";
import assert from "assert";
import { createTeam, createUser } from "../globalHelpers.js";

export class CustomWorld extends World {
  user!: User;
  templatesTeamId!: number;
  demoTeamId!: number;
}

After("@add-user-trigger", async function () {
  await cleanup();
});

Given("the {string} team exists", async function (this, input) {
  const teamSlug = input.toLowerCase();
  const teamId = await createTeam({ slug: teamSlug });

  assert.ok(teamId, `${teamSlug} team is not defined`);

  this[`${teamSlug}TeamId`] = teamId;
});

Given("the Templates team does not exist", async function (this) {
  const templatesTeam = await $admin.team.getBySlug("templates");

  assert.equal(
    templatesTeam,
    undefined,
    "Templates team exists but should not be defined",
  );
});

When<CustomWorld>("a new user is added", async function (this) {
  const userId = await createUser();
  const user = await $admin.user.getById(userId);

  assert.ok(user, "User is not defined");

  this.user = user;
});

When<CustomWorld>("a new demoUser is added", async function (this) {
  const userId = await createDemoUser(this.demoTeamId);
  const demoUser = await $admin.user.getById(userId);

  assert.ok(demoUser, "Demo user is not defined");

  this.user = demoUser;
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
    const userTeamSlugs = this.user.teams.map((userTeam) => userTeam.team.slug);
    const isTemplateTeamMember = userTeamSlugs.includes("templates");

    assert.strictEqual(isTemplateTeamMember, false);
  },
);
