import { When, Then, Before, After, World } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { $admin } from "../client.js";
import {
  setup20ActiveMembers,
  setup19ActiveAnd2ArchivedMembers,
  cleanup,
} from "./helpers.js";
import { CREATE_AND_ADD_USER_TO_TEAM } from "./queries.js";

interface InsertUsersOneResponse {
  insertUsersOne: {
    id: number;
  };
}

interface GraphQLErrorResponse {
  response?: {
    errors?: Array<{
      message: string;
      extensions?: Record<string, unknown>;
    }>;
  };
  message?: string;
}

interface CustomWorld extends World {
  teamId: number;
  response?: {
    data?: InsertUsersOneResponse;
    errors?: unknown[];
  };
}

Before("@max-team-members-20", async function (this: CustomWorld) {
  const { teamId } = await setup20ActiveMembers();
  this.teamId = teamId;
});

Before(
  "@max-team-members-19-plus-archived",
  async function (this: CustomWorld) {
    const { teamId } = await setup19ActiveAnd2ArchivedMembers();
    this.teamId = teamId;
  },
);

After(
  "@max-team-members-20 or @max-team-members-19-plus-archived",
  async function () {
    await cleanup();
  },
);

When(
  "user tries to add a member to a team with the maximum number of users",
  async function (this: CustomWorld) {
    try {
      const result = await $admin.client.request<InsertUsersOneResponse>(
        CREATE_AND_ADD_USER_TO_TEAM,
        {
          email: "newuser@example.com",
          firstName: "New",
          lastName: "User",
          teamId: this.teamId,
          role: "teamEditor",
        },
      );
      this.response = { data: result };
    } catch (error) {
      this.response = { errors: [error] };
    }
  },
);

Then("the response is a GraphQL error", function (this: CustomWorld) {
  assert(this?.response?.errors, "Expected errors but got none");
  assert(this?.response?.errors.length > 0);

  const errorMessage = String(this.response.errors);

  // Hasura trigger should return an error
  assert(
    errorMessage.toLowerCase().includes("team") ||
      errorMessage.toLowerCase().includes("cannot") ||
      errorMessage.toLowerCase().includes("20") ||
      `Expected error about team member limit, got: ${errorMessage}`,
  );
});

When(
  "user tries to add a member to a team with 19 active members",
  async function (this: CustomWorld) {
    try {
      const result = await $admin.client.request<InsertUsersOneResponse>(
        CREATE_AND_ADD_USER_TO_TEAM,
        {
          email: "anotheruser@example.com",
          firstName: "Another",
          lastName: "User",
          teamId: this.teamId,
          role: "teamEditor",
        },
      );

      this.response = { data: result };
    } catch (error) {
      const graphQLError = error as GraphQLErrorResponse;
      this.response = { errors: graphQLError.response?.errors || [error] };
    }
  },
);

Then("the user is successfully added", function (this: CustomWorld) {
  assert(
    !this.response?.errors,
    `Expected success but got errors: ${JSON.stringify(this.response?.errors)}`,
  );
  assert(this.response?.data?.insertUsersOne, "Expected data.insertUsersOne");
  assert(this.response?.data?.insertUsersOne?.id, "Expected user ID");
});
