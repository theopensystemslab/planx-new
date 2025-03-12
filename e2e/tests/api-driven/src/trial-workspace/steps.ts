import {
  After,
  Before,
  DataTable,
  Given,
  Then,
  When,
  World,
} from "@cucumber/cucumber";
import { createUser } from "../demo-workspace/helper.js";
import { strict as assert } from "node:assert";
import {
  assignTeamMember,
  cleanup,
  createTeam,
  FlowRecord,
  getFlowById,
  TeamMember,
  TeamRecord,
  updateFlowStatus,
  UserRecord,
} from "./helpers.js";
import { $admin, getClient } from "../client.js";
import { checkTeamsExist } from "../globalHelpers.js";
import { CoreDomainClient } from "@opensystemslab/planx-core";

export class CustomWorld extends World {
  trialFlowId!: string;
  fullFlowId!: string;
  userClient!: CoreDomainClient["client"];
}

Before("@trial-user-permissions", async function () {
  await cleanup();
});

After("@trial-user-permissions", async function () {
  await cleanup();
});

Given(
  "there is a trial team and full access team:",
  async function (dataTable: DataTable) {
    const [trialTeam, fullTeam] = dataTable.hashes() as TeamRecord[];

    await createTeam(trialTeam);
    await createTeam(fullTeam);

    const createdTeams = await checkTeamsExist([trialTeam, fullTeam]);

    assert.ok(createdTeams[0], "Teams have not been added correctly");
    assert.equal(createdTeams.length, 2, "Not all teams have been added");
  },
);

Given<CustomWorld>(
  "there is one trial user and one full user:",
  async function (this, dataTable: DataTable) {
    const [trialUser, fullUser] = dataTable.hashes() as UserRecord[];

    const trialUserId = await createUser({
      id: Number(trialUser.id),
      firstName: trialUser.first_name,
      lastName: trialUser.last_name,
      email: trialUser.email,
      isPlatformAdmin: false,
    });

    if (trialUserId) {
      const { client: userClient } = await getClient(trialUser.email);
      this.userClient = userClient;
    }

    const fullUserId = await createUser({
      id: Number(fullUser.id),
      firstName: fullUser.first_name,
      lastName: fullUser.last_name,
      email: fullUser.email,
      isPlatformAdmin: false,
    });

    assert.ok(
      trialUserId && fullUserId,
      "Failed to add trial and full access users",
    );
  },
);

Given(
  "these users are assigned to their respective teams:",
  async function (dataTable: DataTable) {
    const [trialUser, fullUser] = dataTable.hashes() as unknown as TeamMember[];

    const trialTeamMember = await assignTeamMember({
      user_id: Number(trialUser.user_id),
      team_id: Number(trialUser.team_id),
      role: trialUser.role,
    });

    const fullTeamMember = await assignTeamMember({
      user_id: Number(fullUser.user_id),
      team_id: Number(fullUser.team_id),
      role: fullUser.role,
    });

    assert.ok(
      trialTeamMember && fullTeamMember,
      "Failed to assign users to teams",
    );
  },
);

Given<CustomWorld>(
  "I have two flows in the database for trial access and full access:",
  async function (this, dataTable: DataTable) {
    const [trialFlow, fullFlow] = dataTable.hashes() as FlowRecord[];

    const trialFlowResponse = await $admin.flow.create({
      teamId: Number(trialFlow.team_id),
      name: trialFlow.name,
      slug: trialFlow.slug,
      userId: Number(trialFlow.creator_id),
      data: {},
    });

    this.trialFlowId = trialFlowResponse;

    const fullFlowResponse = await $admin.flow.create({
      teamId: Number(fullFlow.team_id),
      name: fullFlow.name,
      slug: fullFlow.slug,
      userId: Number(fullFlow.creator_id),
      data: {},
    });

    this.fullFlowId = fullFlowResponse;

    assert.ok(trialFlowResponse && fullFlowResponse, "Flows not added");
  },
);

When<CustomWorld>(
  "a flow has been created by a user from a team with full access",
  async function (this) {
    const accessRights = await getFlowById($admin.client, this.fullFlowId);

    assert.equal(accessRights, "full", "Target flow does not equal full-flow");
  },
);

When<CustomWorld>(
  "a flow has been created by a user from a team with trial access",
  async function (this) {
    const accessRights = await getFlowById($admin.client, this.trialFlowId);

    assert.equal(
      accessRights,
      "trial",
      "Target flow does not equal trial-flow",
    );
  },
);

Then<CustomWorld>(
  "I should be able to update the status",
  async function (this) {
    const accessRightsOfFlowTeam = await updateFlowStatus(
      $admin.client,
      this.fullFlowId,
    );

    assert.equal(accessRightsOfFlowTeam, "full", "Wrong flow updated");
  },
);

Then<CustomWorld>(
  "I should not be able to update the status",
  async function (this) {
    const updateStatusResponse = await updateFlowStatus(
      this.userClient,
      this.trialFlowId,
    );
    assert.equal(
      updateStatusResponse,
      "error updating flow status",
      "Error not thrown",
    );
  },
);
