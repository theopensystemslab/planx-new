import { After, Before, DataTable, Given, World } from "@cucumber/cucumber";
import {
  checkTeamsExist,
  cleanup,
  createDemoUser,
  createFlow,
  createTeams,
  createUser,
  User,
} from "../helper";
import { $admin, getClient } from "../../client";
import { strict as assert } from "node:assert";
import { CoreDomainClient } from "@opensystemslab/planx-core";
import { Team } from "@opensystemslab/planx-core/types";
import { UUID } from "node:crypto";

export class CustomWorld extends World {
  demoClient!: CoreDomainClient["client"];
  adminClient!: CoreDomainClient["client"];
  demoUser!: User;
  otherTeam!: Record<string, string> | undefined;
  insertFlowTeamId!: number;
  demoFlowSlug!: string;
  adminFlowSlug!: string;
  demoTeamsArray!: Team[];
  currentTeamId!: number;
  teamFlows!: { creator_id: number; id: UUID }[];
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
    // I need to then query the database to get the users
    // then assert.ok they exist
    const featureData = dataTable.hashes();

    const userOneId = await createDemoUser({
      ...featureData[0],
      isPlatformAdmin: false,
    });
    const userTwoId = await createUser({
      ...featureData[1],
      isPlatformAdmin: true,
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
    const teamsArray = dataTable.hashes();

    await createTeams(teamsArray);

    const getTeamsArray = await checkTeamsExist(teamsArray);
    this.otherTeam = teamsArray.find((team) => team.slug === "other-team");

    assert.ok(Boolean(getTeamsArray), "Teams have not been added correctly");
  },
);

Given<CustomWorld>(
  "I have the following flows in the database:",
  async function (this, dataTable) {
    const flowsArray = dataTable.hashes();

    const demoFlow = flowsArray.find((flow) => flow.creator_id === "1");
    const adminFlow = flowsArray.find((flow) => flow.creator_id === "2");
    this.demoFlowSlug = demoFlow.slug;
    this.adminFlowSlug = adminFlow.slug;

    const newFlowArray = await Promise.all(
      flowsArray.map(async (flow) => {
        if (flow.creator_id === "1") {
          const flowId = await createFlow(this.demoClient, {
            teamId: Number(flow.team_id),
            name: flow.name,
            slug: flow.slug,
          });
          return flowId;
        }

        if (flow.creator_id === "2") {
          const flowId = await createFlow(this.adminClient, {
            teamId: Number(flow.team_id),
            name: flow.name,
            slug: flow.slug,
          });
          return flowId;
        }
        return "no creator id";
      }),
    );

    assert.ok(
      Boolean(newFlowArray.length === 5),
      "Flows have not been added correctly",
    );
    assert.ok(
      Boolean(!newFlowArray.includes(false)),
      `NewFlowArray is returning: ${newFlowArray}`,
    );
  },
);

Given("I am a demoUser", async function () {
  const userOne = await $admin.user.getById(1);
  assert.ok(
    Boolean(userOne?.teams[0].role === "demoUser"),
    "User 1 is a demo user",
  );
});
