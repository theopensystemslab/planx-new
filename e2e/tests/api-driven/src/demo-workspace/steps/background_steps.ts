import { After, Before, DataTable, Given, World } from "@cucumber/cucumber";
import {
  checkTeamsExist,
  cleanup,
  createDemoUser,
  createFlowFromArray,
  createTeamFromArray,
  createUser,
  DataTableArray,
  DataTableRecord,
  Flow,
} from "../helper.js";
import { $admin, getClient } from "../../client.js";
import { strict as assert } from "node:assert";
import { CoreDomainClient } from "@opensystemslab/planx-core";
import { Team, User } from "@opensystemslab/planx-core/types";
import { UUID } from "crypto";

export class CustomWorld extends World {
  demoClient!: CoreDomainClient["client"];
  adminClient!: CoreDomainClient["client"];
  demoUser!: Omit<User, "teams">;
  otherTeam!: DataTableRecord;
  insertFlowTeamId!: number;
  demoFlowSlug!: string;
  demoFlowId!: UUID;
  adminFlowSlug!: string;
  demoTeamsArray!: Team[];
  currentTeamId!: number;
  teamFlows!: Flow[];
}

Before("@demo-user-permissions", async function () {
  await cleanup();
});

After("@demo-user-permissions", async function () {
  await cleanup();
});

Given(
  "I have two users in the database:",
  async function (dataTable: DataTable) {
    const featureData: DataTableArray = dataTable.hashes();

    const userOneId = await createDemoUser({
      id: Number(featureData[0].id),
      firstName: featureData[0].first_name,
      lastName: featureData[0].last_name,
      email: featureData[0].email,
      isPlatformAdmin: false,
      isAnalyst: false,
      defaultTeamId: null,
    });

    const userTwoId = await createUser({
      id: Number(featureData[1].id),
      firstName: featureData[1].first_name,
      lastName: featureData[1].last_name,
      email: featureData[1].email,
      isPlatformAdmin: true,
      isAnalyst: false,
      defaultTeamId: null,
    });

    const userOne = await $admin.user.getById(userOneId);
    const userTwo = await $admin.user.getById(userTwoId);

    if (userOne) {
      const { client: demoClient } = await getClient(userOne?.email);
      this.demoClient = demoClient;
      this.demoUser = userOne;
    }
    if (userTwo) {
      const { client: adminClient } = await getClient(userTwo?.email);
      this.adminClient = adminClient;
    }

    assert.ok(userOne && userTwo, "Users have not been added correctly");
  },
);

Given<CustomWorld>(
  "I have the following teams in the database:",
  async function (this, dataTable: DataTable) {
    const teamsArray: DataTableArray = dataTable.hashes();

    await createTeamFromArray(teamsArray);

    const getTeamsArray = await checkTeamsExist(teamsArray);
    const otherTeam = teamsArray.find((team) => team.slug === "other-team");
    if (otherTeam) this.otherTeam = otherTeam;

    assert.ok(getTeamsArray, "Teams have not been added correctly");
    assert.equal(
      getTeamsArray.length,
      teamsArray.length,
      "Not all teams have been added",
    );
  },
);

Given<CustomWorld>(
  "I have the following flows in the database:",
  async function (this, dataTable: DataTable) {
    const flowsArray = dataTable.hashes();
    const expectedFlowLength = flowsArray.length;

    const demoFlow = flowsArray.find((flow) => flow.creator_id === "1");
    if (demoFlow) this.demoFlowSlug = demoFlow.slug;

    const newFlowArray: (Flow | false)[] = [];

    for (const flow of flowsArray) {
      let result: Flow | boolean = false;
      if (flow.creator_id === "1") {
        result = await createFlowFromArray(this.demoClient, flow);
      }
      if (flow.creator_id === "2") {
        result = await createFlowFromArray(this.adminClient, flow);
      }
      newFlowArray.push(result);
    }

    assert.equal(
      newFlowArray.length,
      expectedFlowLength,
      "Not all the flows have been added",
    );
    assert.ok(
      newFlowArray.every((result) => result !== false),
      "Flows have not been added successfully",
    );
  },
);

Given("I am a demoUser", async function () {
  const userOne = await $admin.user.getById(1);
  assert.ok(userOne?.teams[0].role === "demoUser", "User 1 is a demo user");
});
