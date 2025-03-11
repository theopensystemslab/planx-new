import {
  After,
  Before,
  DataTable,
  Given,
  Then,
  When,
  World,
} from "@cucumber/cucumber";
import {
  checkTeamsExist,
  createTeamFromArray,
  createUser,
  DataTableArray,
} from "../demo-workspace/helper.js";
import { strict as assert } from "node:assert";
import {
  assignTeamMember,
  cleanup,
  getFlowById,
  updateFlowStatus,
} from "./helpers.js";
import { $admin } from "../client.js";

export class CustomWorld extends World {
  trialFlowId!: string;
  fullFlowId!: string;
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
    const teamsArray: DataTableArray = dataTable.hashes();
    await createTeamFromArray(teamsArray);

    const getTeamsArray = await checkTeamsExist(teamsArray);

    assert.ok(getTeamsArray[0], "Teams have not been added correctly");
    assert.equal(
      getTeamsArray.length,
      teamsArray.length,
      "Not all teams have been added",
    );
  },
);

Given(
  "there is one trial user and one full user:",
  async function (dataTable: DataTable) {
    const [trialAccessUser, fullAccessUser]: DataTableArray =
      dataTable.hashes();

    const userOneId = await createUser({
      id: Number(trialAccessUser.id),
      firstName: trialAccessUser.first_name,
      lastName: trialAccessUser.last_name,
      email: trialAccessUser.email,
      isPlatformAdmin: false,
    });

    const userTwoId = await createUser({
      id: Number(fullAccessUser.id),
      firstName: fullAccessUser.first_name,
      lastName: fullAccessUser.last_name,
      email: fullAccessUser.email,
      isPlatformAdmin: false,
    });

    assert.ok(userOneId && userTwoId, "Users have not been added correctly");
  },
);

Given(
  "these users are assigned to their respective teams:",
  async function (dataTable: DataTable) {
    const [trialUser, fullUser]: DataTableArray = dataTable.hashes();

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

    assert.ok(trialTeamMember && fullTeamMember, "Team members not assigned");
  },
);

Given<CustomWorld>(
  "I two flows in the database for trial access and full access:",
  async function (this, dataTable: DataTable) {
    const [trialAccessFlow, fullAccessFlow]: DataTableArray =
      dataTable.hashes();

    const trialAccessFlowResponse = await $admin.flow.create({
      teamId: Number(trialAccessFlow.team_id),
      name: trialAccessFlow.name,
      slug: trialAccessFlow.slug,
      userId: Number(trialAccessFlow.creator_id),
      data: {},
    });

    this.trialFlowId = trialAccessFlowResponse;

    const fullAccessFlowResponse = await $admin.flow.create({
      teamId: Number(fullAccessFlow.team_id),
      name: fullAccessFlow.name,
      slug: fullAccessFlow.slug,
      userId: Number(fullAccessFlow.creator_id),
      data: {},
    });

    this.fullFlowId = fullAccessFlowResponse;

    assert.ok(
      trialAccessFlowResponse && fullAccessFlowResponse,
      "Flows not added",
    );
  },
);

When<CustomWorld>(
  "a flow has been created by a user from a team with full access",
  async function (this) {
    const targetFlow = await getFlowById($admin.client, this.fullFlowId);

    assert.equal(
      targetFlow,
      "full-flow",
      "Target flow does not equal full-flow",
    );
  },
);

When<CustomWorld>(
  "a flow has been created by a user from a team with trial access",
  async function (this) {
    const targetFlow = await getFlowById($admin.client, this.trialFlowId);

    assert.equal(
      targetFlow,
      "trial-flow",
      "Target flow does not equal trial-flow",
    );
  },
);

Then<CustomWorld>(
  "I should be able to update the status",
  async function (this) {
    const updateStatusResponse = await updateFlowStatus(
      $admin.client,
      this.fullFlowId,
    );

    assert.equal(updateStatusResponse, "full-access", "Wrong flow updated");
  },
);

Then<CustomWorld>(
  "I should not be able to update the status",
  async function (this) {
    const updateStatusResponse = await updateFlowStatus(
      $admin.client,
      this.trialFlowId,
    );
    assert.equal(updateStatusResponse, "trial-access", "Wrong flow updated");
  },
);
