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
  standardFlowId!: string;
  userClient!: CoreDomainClient["client"];
}

Before("@trial-user-permissions", async function () {
  await cleanup();
});

After("@trial-user-permissions", async function () {
  await cleanup();
});

Given(
  "there is a trial team and standard team:",
  async function (dataTable: DataTable) {
    const [trialTeam, standardTeam] =
      dataTable.hashes() as unknown as TeamRecord[];

    await createTeam(trialTeam);
    await createTeam(standardTeam);

    const createdTeams = await checkTeamsExist([trialTeam, standardTeam]);

    assert.ok(createdTeams[0], "Teams have not been added correctly");
    assert.equal(createdTeams.length, 2, "Not all teams have been added");
  },
);

Given<CustomWorld>(
  "there is one trial user and one standard user:",
  async function (this, dataTable: DataTable) {
    const [trialUser, standardUser] = dataTable.hashes() as UserRecord[];

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

    const standardUserId = await createUser({
      id: Number(standardUser.id),
      firstName: standardUser.first_name,
      lastName: standardUser.last_name,
      email: standardUser.email,
      isPlatformAdmin: false,
    });

    assert.ok(
      trialUserId && standardUserId,
      "Failed to add trial and standard users",
    );
  },
);

Given(
  "these users are assigned to their respective teams:",
  async function (dataTable: DataTable) {
    const [trialUser, standardUser] =
      dataTable.hashes() as unknown as TeamMember[];

    const trialTeamMember = await assignTeamMember({
      user_id: Number(trialUser.user_id),
      team_id: Number(trialUser.team_id),
      role: trialUser.role,
    });

    const standardTeamMember = await assignTeamMember({
      user_id: Number(standardUser.user_id),
      team_id: Number(standardUser.team_id),
      role: standardUser.role,
    });

    assert.ok(
      trialTeamMember && standardTeamMember,
      "Failed to assign users to teams",
    );
  },
);

Given<CustomWorld>(
  "I have two flows in the database for trial access and standard access:",
  async function (this, dataTable: DataTable) {
    const [trialFlow, standardFlow] = dataTable.hashes() as FlowRecord[];

    const trialFlowResponse = await $admin.flow.create({
      teamId: Number(trialFlow.team_id),
      name: trialFlow.name,
      slug: trialFlow.slug,
      userId: Number(trialFlow.creator_id),
      data: {},
    });

    this.trialFlowId = trialFlowResponse;

    const standardFlowResponse = await $admin.flow.create({
      teamId: Number(standardFlow.team_id),
      name: standardFlow.name,
      slug: standardFlow.slug,
      userId: Number(standardFlow.creator_id),
      data: {},
    });

    this.standardFlowId = standardFlowResponse;

    assert.ok(trialFlowResponse && standardFlowResponse, "Flows not added");
  },
);

When<CustomWorld>(
  "a flow has been created by a user from a team with standard access",
  async function (this) {
    const isTrialTeam = await getFlowById($admin.client, this.standardFlowId);

    assert.equal(
      isTrialTeam,
      false,
      "Target flow does not come from a standard team",
    );
  },
);

When<CustomWorld>(
  "a flow has been created by a user from a team with trial access",
  async function (this) {
    const isTrialTeam = await getFlowById($admin.client, this.trialFlowId);

    assert.equal(
      isTrialTeam,
      true,
      "Target flow does not come from a trial team",
    );
  },
);

Then<CustomWorld>(
  "I should be able to update the status",
  async function (this) {
    const isTrialTeam = await updateFlowStatus(
      $admin.client,
      this.standardFlowId,
    );

    assert.equal(isTrialTeam, false, "Wrong flow updated");
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
