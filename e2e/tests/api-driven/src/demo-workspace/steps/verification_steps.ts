import { Then } from "@cucumber/cucumber";
import { CustomWorld } from "./background_steps.js";
import { strict as assert } from "node:assert";
import {
  createFlow,
  deleteFlow,
  Flow,
  getFlowBySlug,
  updateFlow,
  updateTeamSettings,
} from "../helper.js";

Then<CustomWorld>("I should only see my own flows", async function (this) {
  assert.equal(
    this.demoUser.id,
    this.teamFlows[0].creator_id,
    "Creator ID is incorrect",
  );
});

Then<CustomWorld>(
  "I should not see flows that I have not created",
  async function (this) {
    const doesContainOtherFlows = this.teamFlows.find(
      (flow) => flow.creator_id !== this.demoUser.id,
    );
    assert.ok(!doesContainOtherFlows, "Other flows are in the array");
  },
);

Then<CustomWorld>(
  "I can access the teams with slug: {string}",
  async function (this, teamSlug) {
    const canAccessTeam = this.demoTeamsArray.find(
      (team) => team.slug === teamSlug,
    );
    assert.ok(canAccessTeam, "Team is not in the array");
  },
);

Then<CustomWorld>(
  "I should not be able to access the Other Team",
  async function (this) {
    const cannotAccessOtherTeam = this.demoTeamsArray.find(
      (team) => team.slug !== this.otherTeam?.slug,
    );
    assert.ok(cannotAccessOtherTeam, "Other Team is in the array");
  },
);

Then<CustomWorld>(
  "I should not be able to create a flow",
  async function (this) {
    let hasSucceeded: Flow | false;
    try {
      hasSucceeded = await createFlow(this.demoClient, {
        name: "Bad flow",
        slug: "bad-flow",
        teamId: this.insertFlowTeamId,
      });
    } catch (error) {
      hasSucceeded = false;
    }
    assert.ok(!hasSucceeded, "Flow was able to be created on this team");
  },
);

Then("I should be able to create a flow in the Demo team", async function () {
  const hasSucceeded = await createFlow(this.demoClient, {
    name: "Good flow",
    slug: "good-flow",
    teamId: 32,
  });
  assert.ok(hasSucceeded, "Flow not added correctly");
});

Then<CustomWorld>("I should be able to see a flow", async function (this) {
  const flow = await getFlowBySlug(this.demoClient, this.adminFlowSlug);
  assert.equal(
    flow.slug,
    this.adminFlowSlug,
    "Incorrect flow has been fetched",
  );
});

Then<CustomWorld>(
  "I should be able to {string} the flow",
  async function (this, action) {
    const demoFlow = await getFlowBySlug(this.demoClient, this.demoFlowSlug);
    const hasSucceeded =
      (await action) === "update"
        ? updateFlow(this.demoClient, demoFlow.id)
        : deleteFlow(this.demoClient, demoFlow.id);

    assert.ok(hasSucceeded, `Cannot ${action} the flow `);
  },
);

Then<CustomWorld>(
  "I should not have access to modify the flow",
  async function (this) {
    const canUpdate = await updateFlow(this.demoClient, this.teamFlows[0].id);
    const canDelete = await deleteFlow(this.demoClient, this.teamFlows[0].id);
    assert.ok(
      !canUpdate && !canDelete,
      "Flow can be modified by the demo user",
    );
  },
);

Then<CustomWorld>(
  "I should not have access to team settings",
  async function (this) {
    const canUpdateSettings = await updateTeamSettings(
      this.demoClient,
      this.currentTeamId,
    );
    assert.ok(!canUpdateSettings, "Demo User can update the team settings");
  },
);
