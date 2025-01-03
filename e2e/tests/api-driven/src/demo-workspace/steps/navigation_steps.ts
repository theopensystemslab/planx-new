import { When } from "@cucumber/cucumber";
import { $admin } from "../../client.js";
import { strict as assert } from "node:assert";
import { getFlowBySlug, getTeamAndFlowsBySlug, getTeams } from "../helper.js";
import { CustomWorld } from "./background_steps.js";

When<CustomWorld>("I am in the {string} team", async function (this, teamSlug) {
  const team = await getTeamAndFlowsBySlug(this.demoClient, teamSlug);
  this.currentTeamId = team.id;
  this.teamFlows = team.flows;
  if (teamSlug !== "demo") {
    this.adminFlowSlug = team.flows[0].slug;
  } else {
    this.demoFlowSlug = team.flows[0].slug;
  }
  assert.equal(teamSlug, team.slug, "Error retrieving the correct team");
});

When<CustomWorld>("I query the teams table", async function (this) {
  const teamsArray = await getTeams(this.demoClient);
  this.demoTeamsArray = teamsArray;
  assert.ok(teamsArray, "Teams not fetched correctly");
});

When<CustomWorld>(
  "I insert a flow into the team: {string}",
  async function (this, teamSlug) {
    const team = await $admin.team.getBySlug(teamSlug);
    this.insertFlowTeamId = team.id;
  },
);

When<CustomWorld>("I am on my own flow", async function (this) {
  const flow = await getFlowBySlug(this.demoClient, this.demoFlowSlug);
  assert.equal(flow.slug, this.demoFlowSlug, "Incorrect flow has been fetched");
});

When<CustomWorld>(
  "I want to edit a flow that I did not create",
  async function (this) {
    const flow = await getFlowBySlug(this.adminClient, this.adminFlowSlug);
    assert.equal(
      flow.slug,
      this.adminFlowSlug,
      "Incorrect flow has been fetched",
    );
  },
);
